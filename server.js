const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Database instance
const db = require('./models/db');

// Route handlers
const indexRouter = require('./routes/index');
const attractionsRouter = require('./routes/attractions');
const packagesRouter = require('./routes/packages');
const bookingRouter = require('./routes/booking');
const contactRouter = require('./routes/contact');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ==========================================
// 1. SECURITY HEADERS (HELMET)
// ==========================================
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow external CDNs (FontAwesome, Bootstrap, Google Fonts, Unsplash)
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'sameorigin' } // Protect against clickjacking
  })
);

// ==========================================
// 2. PARSERS & COOKIES
// ==========================================
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser('kashi-secure-admin-secret-2026'));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d', // 7-day client-side caching for CSS, JS, and WebP images
  etag: true
}));

// ==========================================
// 3. RATE LIMITING (BRUTE-FORCE & BOT PROTECTION)
// ==========================================
// Protect Admin Login against brute-force attacks
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: `
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h2 style="color: #ef4444;">Too many login attempts!</h2>
      <p style="color: #64748b;">For security reasons, your IP has been temporarily restricted. Please wait 15 minutes and try again.</p>
      <a href="/admin/login" style="color: #0f172a; font-weight: bold;">Back to Login</a>
    </div>
  `,
  standardHeaders: true,
  legacyHeaders: false
});

// Protect booking & contact submissions against spam bots
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters to all submission endpoints to prevent bot spam & DoS
app.use('/admin/login', adminLoginLimiter);
app.use('/booking/car', submissionLimiter);
app.use('/booking/hotel', submissionLimiter);
app.use('/booking/package', submissionLimiter);
app.use('/contact', submissionLimiter);
app.use('/reviews/submit', submissionLimiter);

// ==========================================
// 4. VISITOR LOGGING WITH GEOLOCATION & DEVICE ANALYTICS
// ==========================================
const { getClientGeo } = require('./utils/geoTracker');
app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.path.startsWith('/images') &&
    !req.path.startsWith('/css') &&
    !req.path.startsWith('/js') &&
    !req.path.startsWith('/admin') &&
    !req.path.startsWith('/favicon.ico')
  ) {
    const geo = getClientGeo(req);
    db.run(
      `INSERT INTO visitor_logs 
       (ip_address, city, region, country, country_code, device_type, browser, os, page_url, referrer, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        geo.ip,
        geo.city,
        geo.region,
        geo.country,
        geo.countryCode,
        geo.deviceType,
        geo.browser,
        geo.os,
        geo.pageUrl,
        geo.referrer,
        req.headers['user-agent'] || 'Unknown'
      ]
    ).catch(() => {});
  }
  next();
});

// ==========================================
// 5. GLOBAL DYNAMIC SETTINGS MIDDLEWARE
// ==========================================
app.use(async (req, res, next) => {
  // Skip DB query for static files
  if (
    req.path.startsWith('/images') ||
    req.path.startsWith('/css') ||
    req.path.startsWith('/js') ||
    req.path.startsWith('/favicon.ico')
  ) {
    return next();
  }

  try {
    res.locals.settings = await db.getSettings();
    next();
  } catch (err) {
    res.locals.settings = {
      phone_primary: '+91 98765 43210',
      phone_secondary: '+91 90123 45678',
      email: 'info@varanasitravels.com',
      whatsapp: '919876543210',
      address: 'D.47/158, Godowlia - Dashashwamedh Main Road, Varanasi, Uttar Pradesh - 221001',
      site_title: 'Varanasi Travels',
      site_tagline: 'Kashi Tour & Cab Booking',
      ads_code: ''
    };
    next();
  }
});

// ==========================================
// 6. MOUNT ROUTES
// ==========================================
app.use('/', indexRouter);
app.use('/attractions', attractionsRouter);
app.use('/packages', packagesRouter);
app.use('/booking', bookingRouter);
app.use('/contact', contactRouter);
app.use('/admin', adminRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('partials/header', { title: '404 - Page Not Found' });
});

// Global Error Handler (Sanitized to prevent internal schema & path leaks)
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const isDev = process.env.NODE_ENV === 'development';
  const displayMsg = isDev ? String(err.message || 'Server Error').replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'An unexpected error occurred while processing your request. Please try again later.';
  res.status(500).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 60px 20px; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #0c2340; margin-bottom: 12px;">Something went wrong!</h2>
      <p style="color: #64748b; line-height: 1.5; margin-bottom: 24px;">${displayMsg}</p>
      <a href="/" style="display: inline-block; padding: 10px 20px; background: #0c2340; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Return to Home</a>
    </div>
  `);
});

let activePort = Number(PORT);
const server = app.listen(activePort, () => {
  console.log(`✅ Varanasi Tour & Travel server running with full security at: http://localhost:${activePort}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && process.env.PORT === undefined && activePort < PORT + 10) {
    console.warn(`Port ${activePort} is already in use; trying port ${activePort + 1}.`);
    activePort += 1;
    server.listen(activePort);
    return;
  }

  console.error(`Unable to start the server on port ${activePort}:`, err.message);
  process.exitCode = 1;
});
