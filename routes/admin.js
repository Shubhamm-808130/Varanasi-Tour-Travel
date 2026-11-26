const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const upload = require('../utils/uploader');

// Authentication Middleware to isolate Admin Portal
const requireAdminAuth = (req, res, next) => {
  if (req.signedCookies && req.signedCookies.admin_user) {
    res.locals.currentAdmin = req.signedCookies.admin_user;
    return next();
  }
  res.redirect('/admin/login');
};

// ==========================================
// 1. AUTHENTICATION & LOGIN (BCRYPT PROTECTED)
// ==========================================

// GET /admin/login
router.get('/login', (req, res) => {
  if (req.signedCookies && req.signedCookies.admin_user) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: null });
});

// POST /admin/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.render('admin/login', { error: 'Please enter both username and password.' });
    }

    // Check in database admins table
    const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username.trim()]);
    if (!admin) {
      return res.render('admin/login', { error: 'Invalid admin credentials. Please try again.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.render('admin/login', { error: 'Invalid admin credentials. Please try again.' });
    }

    // Update last login timestamp
    await db.run('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

    // Set secure HTTP-only signed cookie
    res.cookie('admin_user', admin.username, {
      signed: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// GET /admin/logout
router.get('/logout', (req, res) => {
  res.clearCookie('admin_user');
  res.redirect('/admin/login');
});

// ==========================================
// 2. DASHBOARD & ANALYTICS (LADDOO ARCHITECTURE)
// ==========================================

router.get('/', requireAdminAuth, async (req, res, next) => {
  try {
    // Concurrent execution of all dashboard metrics and recent rows (6x faster)
    const [
      vehicleCount,
      bookingCount,
      confirmedCount,
      revenueSum,
      inquiryCount,
      reviewCount,
      pendingBookingCount,
      visitorCount,
      uniqueVisitorCount,
      recentBookings,
      recentInquiries,
      vehicleCategories,
      statusDistribution
    ] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM vehicles'),
      db.get('SELECT COUNT(*) as count FROM bookings'),
      db.get("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'CONFIRMED' OR booking_status = 'COMPLETED'"),
      db.get('SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings'),
      db.get('SELECT COUNT(*) as count FROM inquiries'),
      db.get('SELECT COUNT(*) as count FROM reviews WHERE status = "APPROVED"'),
      db.get("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'PENDING'"),
      db.get('SELECT COUNT(*) as count FROM visitor_logs'),
      db.get('SELECT COUNT(DISTINCT ip_address) as count FROM visitor_logs'),
      db.all(
        `SELECT b.*, v.name as vehicle_name, p.title as package_title
         FROM bookings b
         LEFT JOIN vehicles v ON b.vehicle_id = v.id
         LEFT JOIN packages p ON b.package_id = p.id
         ORDER BY b.id DESC LIMIT 8`
      ),
      db.all('SELECT * FROM inquiries ORDER BY id DESC LIMIT 5'),
      db.all('SELECT category, COUNT(*) as count FROM vehicles GROUP BY category'),
      db.all('SELECT booking_status, COUNT(*) as count FROM bookings GROUP BY booking_status')
    ]);

    res.render('admin/dashboard', {
      activeTab: 'dashboard',
      pageTitle: 'Dashboard & Business Analytics',
      metrics: {
        totalVehicles: vehicleCount ? vehicleCount.count : 0,
        totalBookings: bookingCount ? bookingCount.count : 0,
        confirmedBookings: confirmedCount ? confirmedCount.count : 0,
        pendingBookings: pendingBookingCount ? pendingBookingCount.count : 0,
        estimatedRevenue: revenueSum ? revenueSum.total : 0,
        totalInquiries: inquiryCount ? inquiryCount.count : 0,
        approvedReviews: reviewCount ? reviewCount.count : 0,
        totalVisitors: visitorCount ? visitorCount.count : 0,
        uniqueVisitors: uniqueVisitorCount ? uniqueVisitorCount.count : 0
      },
      recentBookings,
      recentInquiries,
      vehicleCategories,
      statusDistribution,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. BOOKINGS & RIDES MANAGER
// ==========================================

router.get('/bookings', requireAdminAuth, async (req, res, next) => {
  try {
    const filter = req.query.status || 'ALL';
    let query = `
      SELECT b.*, v.name as vehicle_name, p.title as package_title, h.name as hotel_name
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      LEFT JOIN packages p ON b.package_id = p.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
    `;
    const params = [];

    if (filter !== 'ALL') {
      query += ' WHERE b.booking_status = ?';
      params.push(filter);
    }
    query += ' ORDER BY b.id DESC';

    const bookings = await db.all(query, params);

    res.render('admin/bookings', {
      activeTab: 'bookings',
      pageTitle: 'Bookings & Rides Control',
      bookings,
      currentFilter: filter,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// Update Booking Status
router.post('/bookings/status', requireAdminAuth, async (req, res, next) => {
  try {
    const { booking_id, status } = req.body;
    await db.run('UPDATE bookings SET booking_status = ? WHERE id = ?', [status, booking_id]);
    res.redirect('/admin/bookings?msg=Booking+status+updated+successfully');
  } catch (err) {
    next(err);
  }
});

// Delete Booking
router.post('/bookings/delete', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    await db.run('DELETE FROM bookings WHERE id = ?', [id]);
    res.redirect('/admin/bookings?msg=Booking+record+deleted+successfully');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. CAB FLEET & TARIFFS MANAGER
// ==========================================

// Vehicles Multer middleware supporting primary photo + up to 5 slide photos
const vehicleUpload = upload.fields([
  { name: 'image_file', maxCount: 1 },
  { name: 'gallery_files', maxCount: 5 }
]);

router.get('/vehicles', requireAdminAuth, async (req, res, next) => {
  try {
    const vehicles = await db.all('SELECT * FROM vehicles ORDER BY id ASC');
    vehicles.forEach(v => {
      v.slides = db.parseVehicleSlides(v);
    });

    res.render('admin/vehicles', {
      activeTab: 'vehicles',
      pageTitle: 'Cab Fleet & Tariff Rates',
      vehicles,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// Add Vehicle (with file upload or URL + up to 5 slide images)
router.post('/vehicles/add', requireAdminAuth, vehicleUpload, upload.optimizeImages, async (req, res, next) => {
  try {
    const { name, category, capacity, luggage_capacity, total_quantity, local_base_rate, outstation_rate_per_km, airport_transfer_rate, image_url, gallery_urls, features } = req.body;
    let finalImageUrl = image_url;
    if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
      finalImageUrl = '/images/uploads/' + req.files['image_file'][0].filename;
    }

    // Process up to 5 slide images
    let slides = [];
    if (req.files && req.files['gallery_files'] && req.files['gallery_files'].length > 0) {
      req.files['gallery_files'].forEach(f => {
        slides.push('/images/uploads/' + f.filename);
      });
    }
    if (gallery_urls && gallery_urls.trim()) {
      const urls = gallery_urls.split(/[\r\n,]+/).map(u => u.trim()).filter(u => u.length > 5);
      slides.push(...urls);
    }
    if (slides.length === 0 && finalImageUrl) {
      slides.push(finalImageUrl);
    }
    slides = slides.slice(0, 5);
    const galleryJson = JSON.stringify(slides);

    await db.run(
      `INSERT INTO vehicles (name, category, capacity, luggage_capacity, total_quantity, ac, local_base_rate, outstation_rate_per_km, airport_transfer_rate, image_url, gallery_images, features)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
      [name, category, capacity, luggage_capacity || 2, parseInt(total_quantity) || 3, local_base_rate, outstation_rate_per_km, airport_transfer_rate, finalImageUrl, galleryJson, features || 'Clean AC, Verified Driver']
    );
    res.redirect('/admin/vehicles?msg=New+vehicle+with+slides+added+successfully');
  } catch (err) {
    next(err);
  }
});

// Edit Vehicle (supports updating primary image and up to 5 slide images)
router.post('/vehicles/edit', requireAdminAuth, vehicleUpload, upload.optimizeImages, async (req, res, next) => {
  try {
    const { id, name, category, capacity, luggage_capacity, total_quantity, local_base_rate, outstation_rate_per_km, airport_transfer_rate, image_url, gallery_urls, existing_gallery, features } = req.body;
    let finalImageUrl = image_url;
    if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
      finalImageUrl = '/images/uploads/' + req.files['image_file'][0].filename;
    }

    let slides = [];
    // 1. Check if user typed or edited URLs in textarea
    if (gallery_urls && gallery_urls.trim()) {
      const urls = gallery_urls.split(/[\r\n,]+/).map(u => u.trim()).filter(u => u.length > 5);
      slides.push(...urls);
    } else if (existing_gallery) {
      try {
        const parsed = JSON.parse(existing_gallery);
        if (Array.isArray(parsed)) slides = parsed;
      } catch (e) {}
    }

    // 2. Newly uploaded slide files
    if (req.files && req.files['gallery_files'] && req.files['gallery_files'].length > 0) {
      const newUploads = req.files['gallery_files'].map(f => '/images/uploads/' + f.filename);
      slides = [...newUploads, ...slides];
    }

    if (slides.length === 0 && finalImageUrl) {
      slides.push(finalImageUrl);
    }
    slides = slides.slice(0, 5);
    const galleryJson = JSON.stringify(slides);

    await db.run(
      `UPDATE vehicles SET 
        name = ?, category = ?, capacity = ?, luggage_capacity = ?, total_quantity = ?, 
        local_base_rate = ?, outstation_rate_per_km = ?, airport_transfer_rate = ?, 
        image_url = ?, gallery_images = ?, features = ? 
       WHERE id = ?`,
      [name, category, capacity, luggage_capacity, parseInt(total_quantity) || 3, local_base_rate, outstation_rate_per_km, airport_transfer_rate, finalImageUrl, galleryJson, features, id]
    );
    res.redirect('/admin/vehicles?msg=Vehicle+rates+and+photo+slides+updated+successfully');
  } catch (err) {
    next(err);
  }
});

// Delete Vehicle
router.post('/vehicles/delete', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    await db.run('DELETE FROM vehicles WHERE id = ?', [id]);
    res.redirect('/admin/vehicles?msg=Vehicle+removed+successfully');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. VISITING PLACES & DISTANCE CHART
// ==========================================

router.get('/attractions', requireAdminAuth, async (req, res, next) => {
  try {
    const attractions = await db.all('SELECT * FROM attractions ORDER BY distance_km ASC');
    res.render('admin/attractions', {
      activeTab: 'attractions',
      pageTitle: 'Visiting Places & Distance Chart',
      attractions,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// Add Attraction
router.post('/attractions/add', requireAdminAuth, upload.single('image_file'), upload.optimizeImages, async (req, res, next) => {
  try {
    const { name, hindi_name, category, distance_km, travel_time, entry_fee, timings, best_time, description, image_url, location } = req.body;
    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = '/images/uploads/' + req.file.filename;
    }

    await db.run(
      `INSERT INTO attractions (name, hindi_name, category, distance_km, travel_time, entry_fee, timings, best_time, description, highlights, image_url, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, hindi_name, category, distance_km, travel_time, entry_fee || 0, timings, best_time, description, name, finalImageUrl, location || 'Varanasi']
    );
    res.redirect('/admin/attractions?msg=Visiting+place+added+successfully');
  } catch (err) {
    next(err);
  }
});

// Edit Attraction
router.post('/attractions/edit', requireAdminAuth, upload.single('image_file'), upload.optimizeImages, async (req, res, next) => {
  try {
    const { id, name, hindi_name, category, distance_km, travel_time, entry_fee, timings, best_time, description, image_url } = req.body;
    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = '/images/uploads/' + req.file.filename;
    }

    await db.run(
      `UPDATE attractions SET 
        name = ?, hindi_name = ?, category = ?, distance_km = ?, travel_time = ?, 
        entry_fee = ?, timings = ?, best_time = ?, description = ?, image_url = ? 
       WHERE id = ?`,
      [name, hindi_name, category, distance_km, travel_time, entry_fee, timings, best_time, description, finalImageUrl, id]
    );
    res.redirect('/admin/attractions?msg=Place+details+updated+successfully');
  } catch (err) {
    next(err);
  }
});

// Delete Attraction
router.post('/attractions/delete', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    await db.run('DELETE FROM attractions WHERE id = ?', [id]);
    res.redirect('/admin/attractions?msg=Place+deleted+successfully');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 6. TOUR PACKAGES MANAGER
// ==========================================

router.get('/packages', requireAdminAuth, async (req, res, next) => {
  try {
    const packages = await db.all('SELECT * FROM packages ORDER BY id ASC');
    res.render('admin/packages', {
      activeTab: 'packages',
      pageTitle: 'Tour Packages Manager',
      packages,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// Add Package
router.post('/packages/add', requireAdminAuth, upload.single('image_file'), upload.optimizeImages, async (req, res, next) => {
  try {
    const { title, subtitle, duration, price, original_price, image_url, badge, highlights, itinerary, inclusions, exclusions } = req.body;
    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = '/images/uploads/' + req.file.filename;
    }

    await db.run(
      `INSERT INTO packages (title, subtitle, duration, price, original_price, image_url, badge, highlights, itinerary, inclusions, exclusions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle, duration, price, original_price || null, finalImageUrl, badge, highlights, itinerary, inclusions, exclusions]
    );
    res.redirect('/admin/packages?msg=New+tour+package+added+successfully');
  } catch (err) {
    next(err);
  }
});

// Edit Package
router.post('/packages/edit', requireAdminAuth, upload.single('image_file'), upload.optimizeImages, async (req, res, next) => {
  try {
    const { id, title, subtitle, duration, price, original_price, image_url, badge, highlights, itinerary, inclusions, exclusions } = req.body;
    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = '/images/uploads/' + req.file.filename;
    }

    await db.run(
      `UPDATE packages SET 
        title = ?, subtitle = ?, duration = ?, price = ?, original_price = ?, 
        image_url = ?, badge = ?, highlights = ?, itinerary = ?, inclusions = ?, exclusions = ? 
       WHERE id = ?`,
      [title, subtitle, duration, price, original_price, finalImageUrl, badge, highlights, itinerary, inclusions, exclusions, id]
    );
    res.redirect('/admin/packages?msg=Package+updated+successfully');
  } catch (err) {
    next(err);
  }
});

// Delete Package
router.post('/packages/delete', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    await db.run('DELETE FROM packages WHERE id = ?', [id]);
    res.redirect('/admin/packages?msg=Package+deleted+successfully');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 7. INQUIRIES & LEADS MANAGER
// ==========================================

router.get('/inquiries', requireAdminAuth, async (req, res, next) => {
  try {
    const inquiries = await db.all('SELECT * FROM inquiries ORDER BY id DESC');
    res.render('admin/inquiries', {
      activeTab: 'inquiries',
      pageTitle: 'Customer Inquiries & Leads',
      inquiries,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// Update Inquiry Status
router.post('/inquiries/status', requireAdminAuth, async (req, res, next) => {
  try {
    const { inquiry_id, status } = req.body;
    await db.run('UPDATE inquiries SET status = ? WHERE id = ?', [status, inquiry_id]);
    res.redirect('/admin/inquiries?msg=Inquiry+status+updated');
  } catch (err) {
    next(err);
  }
});

// Delete Inquiry
router.post('/inquiries/delete', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    await db.run('DELETE FROM inquiries WHERE id = ?', [id]);
    res.redirect('/admin/inquiries?msg=Inquiry+removed');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 8. CUSTOMER REVIEWS MANAGER
// ==========================================

router.get('/reviews', requireAdminAuth, async (req, res, next) => {
  try {
    const reviews = await db.all('SELECT * FROM reviews ORDER BY id DESC');
    res.render('admin/reviews', {
      activeTab: 'reviews',
      pageTitle: 'Customer Reviews & Ratings',
      reviews,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// Add Review Manually
router.post('/reviews/add', requireAdminAuth, async (req, res, next) => {
  try {
    const { customer_name, rating, trip_type, comment, status } = req.body;
    await db.run(
      'INSERT INTO reviews (customer_name, rating, trip_type, comment, status) VALUES (?, ?, ?, ?, ?)',
      [customer_name, parseInt(rating) || 5, trip_type, comment, status || 'APPROVED']
    );
    res.redirect('/admin/reviews?msg=Review+added+successfully');
  } catch (err) {
    next(err);
  }
});

// Update Review Status
router.post('/reviews/status', requireAdminAuth, async (req, res, next) => {
  try {
    const { review_id, status } = req.body;
    await db.run('UPDATE reviews SET status = ? WHERE id = ?', [status, review_id]);
    res.redirect('/admin/reviews?msg=Review+status+updated');
  } catch (err) {
    next(err);
  }
});

// Delete Review
router.post('/reviews/delete', requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    await db.run('DELETE FROM reviews WHERE id = ?', [id]);
    res.redirect('/admin/reviews?msg=Review+deleted');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 9. PHOTO & MEDIA MANAGER (FAST UPLOAD)
// ==========================================

router.get('/media', requireAdminAuth, async (req, res, next) => {
  try {
    const attractions = await db.all('SELECT id, name, category, image_url FROM attractions ORDER BY id ASC');
    const vehicles = await db.all('SELECT id, name, category, image_url FROM vehicles ORDER BY id ASC');

    // Read files uploaded to public/images/uploads
    const uploadsDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
    let uploadedFiles = [];
    if (fs.existsSync(uploadsDir)) {
      uploadedFiles = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
    }

    res.render('admin/media', {
      activeTab: 'media',
      pageTitle: 'Photo & Media Uploads',
      attractions,
      vehicles,
      uploadedFiles,
      successMessage: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// Direct Image Upload
router.post('/media/upload', requireAdminAuth, upload.single('media_file'), upload.optimizeImages, (req, res) => {
  if (!req.file) {
    return res.redirect('/admin/media?msg=Please+select+an+image+file+to+upload');
  }
  const fileUrl = '/images/uploads/' + req.file.filename;
  res.redirect('/admin/media?msg=Image+uploaded+successfully:+Link=' + encodeURIComponent(fileUrl));
});

// ==========================================
// 10. WEBSITE SETTINGS & SEO
// ==========================================

router.get('/settings', requireAdminAuth, async (req, res, next) => {
  try {
    const rows = await db.all('SELECT key, value FROM site_settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });

    res.render('admin/settings', {
      activeTab: 'settings',
      pageTitle: 'Website Global Settings & SEO',
      settings,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

router.post('/settings', requireAdminAuth, async (req, res, next) => {
  try {
    const { phone_primary, phone_secondary, email, whatsapp, address, site_title, site_tagline, ads_code } = req.body;

    const updates = [
      { key: 'phone_primary', value: phone_primary },
      { key: 'phone_secondary', value: phone_secondary },
      { key: 'email', value: email },
      { key: 'whatsapp', value: whatsapp },
      { key: 'address', value: address },
      { key: 'site_title', value: site_title },
      { key: 'site_tagline', value: site_tagline },
      { key: 'ads_code', value: ads_code }
    ];

    for (const u of updates) {
      if (u.value !== undefined) {
        await db.run('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', [u.key, u.value]);
      }
    }

    // Refresh in-memory settings cache
    if (typeof db.invalidateSettingsCache === 'function') {
      db.invalidateSettingsCache();
    }

    res.redirect('/admin/settings?msg=Website+settings+updated+successfully');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 11. ADMIN PROFILE & SECURITY (LADDOO ADMIN STYLE)
// ==========================================

router.get('/profile', requireAdminAuth, async (req, res, next) => {
  try {
    const currentUsername = req.signedCookies.admin_user;
    const admin = await db.get('SELECT id, username, email, role, last_login, created_at FROM admins WHERE username = ?', [currentUsername]);

    res.render('admin/profile', {
      activeTab: 'profile',
      pageTitle: 'Admin Profile & Security Center',
      admin: admin || { username: currentUsername, email: 'admin@varanasitravels.com' },
      msg: req.query.msg || null,
      msgType: req.query.type || 'info'
    });
  } catch (err) {
    next(err);
  }
});

// Update Profile Details (Username / Email)
router.post('/profile/update', requireAdminAuth, async (req, res, next) => {
  try {
    const currentUsername = req.signedCookies.admin_user;
    const { username, email } = req.body;

    if (!username || username.trim() === '') {
      return res.redirect('/admin/profile?msg=Username+cannot+be+empty&type=danger');
    }

    const check = await db.get('SELECT id FROM admins WHERE username = ? AND username != ?', [username.trim(), currentUsername]);
    if (check) {
      return res.redirect('/admin/profile?msg=That+username+is+already+taken&type=danger');
    }

    await db.run('UPDATE admins SET username = ?, email = ? WHERE username = ?', [username.trim(), email.trim(), currentUsername]);

    // Update cookie session
    res.cookie('admin_user', username.trim(), {
      signed: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect('/admin/profile?msg=Profile+updated+successfully&type=success');
  } catch (err) {
    next(err);
  }
});

// Change Password with BCrypt
router.post('/profile/change-password', requireAdminAuth, async (req, res, next) => {
  try {
    const currentUsername = req.signedCookies.admin_user;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.redirect('/admin/profile?msg=All+password+fields+are+required&type=danger');
    }

    if (new_password.length < 6) {
      return res.redirect('/admin/profile?msg=New+password+must+be+at+least+6+characters+long&type=danger');
    }

    if (new_password !== confirm_password) {
      return res.redirect('/admin/profile?msg=New+passwords+do+not+match&type=danger');
    }

    const admin = await db.get('SELECT id, password_hash FROM admins WHERE username = ?', [currentUsername]);
    if (!admin) {
      return res.redirect('/admin/login');
    }

    const isMatch = await bcrypt.compare(current_password, admin.password_hash);
    if (!isMatch) {
      return res.redirect('/admin/profile?msg=Incorrect+current+password&type=danger');
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(new_password, salt);

    await db.run('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, admin.id]);

    res.redirect('/admin/profile?msg=Password+changed+successfully!+Keep+it+safe.&type=success');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 12. VISITORS & GEOLOCATION ANALYTICS (LADDOO ARCHITECTURE)
// ==========================================

router.get('/visitors', requireAdminAuth, async (req, res, next) => {
  try {
    // 1. Core Traffic Metrics
    const totalViewsRow = await db.get('SELECT COUNT(*) as count FROM visitor_logs');
    const uniqueIpsRow = await db.get('SELECT COUNT(DISTINCT ip_address) as count FROM visitor_logs');
    const todayViewsRow = await db.get("SELECT COUNT(*) as count FROM visitor_logs WHERE date(visited_at) = date('now')");
    const mobileViewsRow = await db.get("SELECT COUNT(*) as count FROM visitor_logs WHERE device_type = 'Mobile'");

    const totalViews = totalViewsRow ? totalViewsRow.count : 0;
    const uniqueIps = uniqueIpsRow ? uniqueIpsRow.count : 0;
    const todayViews = todayViewsRow ? todayViewsRow.count : 0;
    const mobileViews = mobileViewsRow ? mobileViewsRow.count : 0;

    // 2. Geolocation Distribution: Top Cities & States
    const topCities = await db.all(`
      SELECT city, region, country, country_code, COUNT(*) as visit_count 
      FROM visitor_logs 
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city, region, country 
      ORDER BY visit_count DESC 
      LIMIT 8
    `);

    // 3. Device & OS Distribution
    const deviceStats = await db.all(`
      SELECT COALESCE(device_type, 'Desktop') as device_type, COUNT(*) as count 
      FROM visitor_logs 
      GROUP BY device_type
    `);

    const osStats = await db.all(`
      SELECT COALESCE(os, 'Windows') as os, COUNT(*) as count 
      FROM visitor_logs 
      GROUP BY os
    `);

    // 4. Live Detailed Traffic Stream (Last 100 entries)
    const recentLogs = await db.all(`
      SELECT * FROM visitor_logs 
      ORDER BY id DESC 
      LIMIT 100
    `);

    res.render('admin/visitors', {
      activeTab: 'visitors',
      pageTitle: 'Visitors & Geolocation Analytics',
      metrics: {
        totalViews,
        uniqueIps,
        todayViews,
        mobileViews
      },
      topCities,
      deviceStats,
      osStats,
      recentLogs,
      msg: req.query.msg || null
    });
  } catch (err) {
    next(err);
  }
});

// Clear logs action
router.post('/visitors/clear', requireAdminAuth, async (req, res, next) => {
  try {
    await db.run('DELETE FROM visitor_logs');
    res.redirect('/admin/visitors?msg=Visitor+logs+cleared+successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
