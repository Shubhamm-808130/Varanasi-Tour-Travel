const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tour.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    db.run('PRAGMA journal_mode = WAL;');
  }
});

// Promise wrappers for async/await usage
const queryAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const queryGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const queryRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Initialize schema
const initSchema = async () => {
  await queryRun(`
    CREATE TABLE IF NOT EXISTS attractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hindi_name TEXT,
      category TEXT NOT NULL,
      distance_km REAL NOT NULL,
      travel_time TEXT NOT NULL,
      entry_fee REAL DEFAULT 0,
      timings TEXT,
      best_time TEXT,
      description TEXT,
      highlights TEXT,
      image_url TEXT,
      location TEXT
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      luggage_capacity INTEGER DEFAULT 2,
      ac INTEGER DEFAULT 1,
      local_base_rate REAL NOT NULL,
      outstation_rate_per_km REAL NOT NULL,
      airport_transfer_rate REAL NOT NULL,
      image_url TEXT,
      features TEXT
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      duration TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      image_url TEXT,
      badge TEXT,
      highlights TEXT,
      itinerary TEXT,
      inclusions TEXT,
      exclusions TEXT
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS hotels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      rating REAL DEFAULT 4.5,
      reviews_count INTEGER DEFAULT 120,
      price_per_night REAL NOT NULL,
      distance_to_ghat TEXT,
      location TEXT,
      amenities TEXT,
      image_url TEXT
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_ref TEXT UNIQUE NOT NULL,
      booking_type TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      service_date TEXT NOT NULL,
      pickup_location TEXT,
      drop_location TEXT,
      vehicle_id INTEGER,
      hotel_id INTEGER,
      package_id INTEGER,
      passengers INTEGER DEFAULT 1,
      selected_attractions TEXT,
      total_amount REAL NOT NULL,
      payment_status TEXT DEFAULT 'PENDING',
      booking_status TEXT DEFAULT 'CONFIRMED',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (hotel_id) REFERENCES hotels(id),
      FOREIGN KEY (package_id) REFERENCES packages(id)
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      travel_date TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'NEW',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'superadmin',
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      trip_type TEXT,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'APPROVED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await queryRun(`
    CREATE TABLE IF NOT EXISTS visitor_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT,
      city TEXT,
      region TEXT,
      country TEXT,
      country_code TEXT,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      page_url TEXT,
      referrer TEXT,
      user_agent TEXT,
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing table if needed
  try {
    await queryRun('ALTER TABLE bookings ADD COLUMN pickup_coords TEXT');
  } catch (e) {}

  try {
    await queryRun('ALTER TABLE vehicles ADD COLUMN total_quantity INTEGER DEFAULT 3');
  } catch (e) {}

  try {
    await queryRun('ALTER TABLE vehicles ADD COLUMN gallery_images TEXT');
  } catch (e) {}

  // Set default stock and default 5-slide gallery for standard fleet
  try {
    await queryRun("UPDATE vehicles SET total_quantity = 3 WHERE category = 'Sedan' AND (total_quantity IS NULL OR total_quantity = 1)");
    await queryRun("UPDATE vehicles SET total_quantity = 2 WHERE category LIKE '%SUV%' AND (total_quantity IS NULL OR total_quantity = 1)");
    await queryRun("UPDATE vehicles SET total_quantity = 1 WHERE category LIKE '%Group%' AND (total_quantity IS NULL OR total_quantity = 1)");

    // Populate initial 5 slides for each car if null
    const v1Slides = JSON.stringify([
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80'
    ]);
    const v2Slides = JSON.stringify([
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    ]);
    const v3Slides = JSON.stringify([
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    ]);
    const v4Slides = JSON.stringify([
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    ]);

    await queryRun('UPDATE vehicles SET gallery_images = ? WHERE id = 1 AND gallery_images IS NULL', [v1Slides]);
    await queryRun('UPDATE vehicles SET gallery_images = ? WHERE id = 2 AND gallery_images IS NULL', [v2Slides]);
    await queryRun('UPDATE vehicles SET gallery_images = ? WHERE id = 3 AND gallery_images IS NULL', [v3Slides]);
    await queryRun('UPDATE vehicles SET gallery_images = ? WHERE id = 4 AND gallery_images IS NULL', [v4Slides]);
  } catch (e) {}

  const visitorCols = ['city', 'region', 'country', 'country_code', 'device_type', 'browser', 'os', 'referrer'];
  for (const col of visitorCols) {
    try {
      await queryRun(`ALTER TABLE visitor_logs ADD COLUMN ${col} TEXT`);
    } catch (e) {}
  }

  // Default settings
  const defaultSettings = [
    { key: 'phone_primary', value: '+91 98765 43210' },
    { key: 'phone_secondary', value: '+91 90123 45678' },
    { key: 'email', value: 'info@varanasitravels.com' },
    { key: 'whatsapp', value: '919876543210' },
    { key: 'address', value: 'D.47/158, Godowlia - Dashashwamedh Main Road, Varanasi, Uttar Pradesh - 221001' },
    { key: 'site_title', value: 'Varanasi Travels' },
    { key: 'site_tagline', value: 'Kashi Tour & Cab Booking' }
  ];

  for (const s of defaultSettings) {
    await queryRun(
      'INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)',
      [s.key, s.value]
    );
  }

  // Seed default admin with bcrypt hash if none exists
  const existingAdmin = await queryGet('SELECT id FROM admins WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);
    await queryRun(
      'INSERT INTO admins (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
      ['admin', hash, 'admin@varanasitravels.com', 'superadmin']
    );
  }

  // Seed default reviews if none exists
  const existingReviews = await queryGet('SELECT COUNT(*) as count FROM reviews');
  if (existingReviews && existingReviews.count === 0) {
    const defaultReviews = [
      { name: 'Dr. Ramesh Sharma (Mumbai)', rating: 5, trip: '2-Day Kashi Darshan & Ganga Boat', comment: 'Excellent cab service! The driver Santosh was very polite, reached Varanasi Cantt station on time, and helped my elderly parents for VIP Darshan at Kashi Vishwanath.' },
      { name: 'Pooja Agarwal (Delhi)', rating: 5, trip: 'Innova Crysta Airport Transfer & Sarnath', comment: 'Super clean Innova Crysta, chilled AC and very smooth booking experience. Honest driver who gave great local food recommendations in Godowlia!' },
      { name: 'Suresh Menon (Bangalore)', rating: 5, trip: 'Ayodhya - Prayagraj - Varanasi Tour', comment: 'Our 4-day pilgrimage package was perfectly arranged. Safe driving on highways and all hotel pickups were seamless. 10/10 recommend!' }
    ];
    for (const r of defaultReviews) {
      await queryRun('INSERT INTO reviews (customer_name, rating, trip_type, comment, status) VALUES (?, ?, ?, ?, ?)', [r.name, r.rating, r.trip, r.comment, 'APPROVED']);
    }
  }
};

initSchema().catch(err => {
  console.error('Error initializing SQLite schema:', err);
});

// In-memory cache for site settings to eliminate repetitive DB queries
let cachedSettings = null;
let lastSettingsFetch = 0;

const getSettings = async () => {
  const now = Date.now();
  if (cachedSettings && (now - lastSettingsFetch < 60000)) {
    return cachedSettings;
  }
  const rows = await queryAll('SELECT key, value FROM site_settings');
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  cachedSettings = settings;
  lastSettingsFetch = now;
  return settings;
};

const invalidateSettingsCache = () => {
  cachedSettings = null;
  lastSettingsFetch = 0;
};

/** Parse up to 5 slide image URLs from a vehicle row, falling back to image_url. */
const parseVehicleSlides = (v) => {
  let slides = [];
  if (v && v.gallery_images) {
    try {
      const parsed = JSON.parse(v.gallery_images);
      if (Array.isArray(parsed)) slides = parsed;
    } catch (e) {
      slides = [];
    }
  }
  if (!slides.length) {
    slides = [(v && v.image_url) || '/images/cars/dzire.webp'];
  }
  return slides.slice(0, 5);
};

module.exports = {
  db,
  all: queryAll,
  get: queryGet,
  run: queryRun,
  initSchema,
  getSettings,
  invalidateSettingsCache,
  parseVehicleSlides
};
