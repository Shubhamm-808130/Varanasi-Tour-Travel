# Project Tasks & Implementation Checklist

## Phase 1: Environment & Dependencies
- [x] Analyze benchmark sites (`varanasitravels.com`, `kashivoyagestours.com`, `varanasi-tourism.in`, `varanasiyatraa.com`)
- [x] Create project documentation (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `tasks.md`, `memory.md`)
- [x] Configure `package.json` with robust dependencies (`express`, `ejs`, `sqlite3`, `body-parser`)
- [x] Install project npm packages and verify execution

## Phase 2: Database Schema & Comprehensive Data Seeding
- [x] Implement `models/db.js` with SQLite database connection and async helper wrappers
- [x] Implement `models/seed.js` with rich, verified Varanasi travel data:
  - 11 major tourist attractions (Kashi Vishwanath Corridor, Dashashwamedh Ghat Aarti, Manikarnika Ghat, Assi Ghat Subah-e-Banaras, Sarnath Dhamek Stupa, Ramnagar Fort, Sankat Mochan Temple, Kaal Bhairav, Tulsi Manas Temple, New Vishwanath BHU, Durga Kund) with exact distances, travel time, entry fees, timings.
  - 4 Cab fleet categories (Dzire/Etios, Ertiga, Innova Crysta, Tempo Traveller) with full-day, per-km, and airport tariffs.
  - 4 Curated Tour Packages (Kashi Darshan Day Tour, Ganga Aarti Boat & Ghat Walk, 3D/2N Kashi Spiritual Journey, 4D/3N Varanasi-Prayagraj-Ayodhya Circuit).
  - 4 Partner Hotels (Ghat-side Heritage Haveli, Luxury Hotel near Cantt, 3-Star Deluxe Godowlia, Budget Pilgrims Inn).

## Phase 3: Layout & Responsive Theme Styling
- [x] Create `views/partials/header.ejs` with top contact bar, logo, and responsive navigation
- [x] Create `views/partials/footer.ejs` with sitemap, office info, and floating WhatsApp pill
- [x] Build `public/css/style.css` with professional Varanasi tourism styling (navy/saffron palette, cards, badges, sticky buttons)
- [x] Build `public/js/main.js` with interactive car booking calculator, attraction multi-select distance calculation, and filter tabs

## Phase 4: Page Views & Route Implementation
- [x] Build Homepage `views/index.ejs` & `routes/index.js`
- [x] Build Attractions Directory `views/attractions.ejs` & `routes/attractions.js`
- [x] Build Packages Directory `views/packages.ejs` & `routes/packages.js`
- [x] Build Car Booking Wizard `views/car_booking.ejs` & `routes/booking.js` with dynamic pricing
- [x] Build Hotel Booking Page `views/hotel_booking.ejs`
- [x] Build Distance Chart Page `views/distance_chart.ejs`
- [x] Build Contact Us Page `views/contact.ejs` & `routes/contact.js`
- [x] Build Booking Success Receipt `views/booking_success.ejs` with reference ID

## Phase 5: Admin Panel & Protection
- [x] Implement `routes/admin.js` with dashboard and status management
- [x] Build `views/admin/dashboard.ejs` to view real-time bookings and inquiries
- [x] Allow status updates (Confirmed, Pending, Cancelled)

## Phase 6: Testing & Verification
- [x] Test car booking flow from start to mock payment receipt
- [x] Test hotel booking and custom package inquiry form
- [x] Test attraction category filtering and distance information
- [x] Verify responsive display on mobile viewport

## Phase 7: Laddoo Admin Architecture Adaptation & Enterprise Security
- [x] Researched reference e-commerce admin panel at `c:\xampp\htdocs\Laddoo\Admin`
- [x] Modeled complete Tour & Travel Admin Suite:
  - Collapsible dark sidebar (`admin-layout.css`) with status pulse indicator & active tab highlights
  - Live digital clock & Topbar quick controls
  - Stat cards with vibrant gradients (`blue`, `green`, `orange`, `red`, `purple`, `darkorange`)
  - Chart.js interactive analytics for booking velocity & fleet categories
  - Dedicated Bookings & Rides Manager (`/admin/bookings`) with WhatsApp link & status actions
  - Fleet & Tariffs Manager (`/admin/vehicles`) with 8h/80km rates, per-km, and airport fares
  - Visiting Places & Distances Chart (`/admin/attractions`) with KM distances, travel time, and fees
  - Tour Packages Manager (`/admin/packages`) with pricing, itineraries, and inclusions
  - Inquiries & Leads Manager (`/admin/inquiries`) with one-click reply
  - Customer Reviews Moderation (`/admin/reviews`) with 1-5 star ratings
  - Photo & Media Manager (`/admin/media`) with safe file upload & instant URL copying
  - Global Website Settings & SEO (`/admin/settings`) with phone, WhatsApp, email, address, and Google Ads slot
  - Admin Profile & Security Center (`/admin/profile`)
- [x] Full Security Implementation:
  - **BCrypt Hashing**: Admin passwords salted and hashed with 10 rounds (no plaintext passwords)
  - **Rate Limiting**: `express-rate-limit` prevents brute-force password guessing on `/admin/login` (10 per 15 mins) and spambot form flooding
  - **Helmet Security**: Strict HTTP headers preventing clickjacking (`frameguard: sameorigin`), MIME-sniffing, and XSS
  - **Upload Validation**: `uploader.js` strictly validates extensions (`.jpg`, `.jpeg`, `.png`, `.webp`) and MIME types, generates cryptographically safe random filenames
  - **Signed HttpOnly Cookies**: Admin session cookie protected against client-side script tampering
  - **SQL Injection Prevention**: 100% Parameterized queries across SQLite database

## Phase 8: Real-Time Visitor Tracking & Geolocation Analytics
- [x] Integrated `geoip-lite` with offline IP resolution and `utils/geoTracker.js`
- [x] Expanded `visitor_logs` schema with `city`, `region`, `country`, `country_code`, `device_type`, `browser`, `os`, `referrer`
- [x] Built dedicated Visitor Analytics Center at `/admin/visitors` with:
  - Total Page Hits, Unique IPs, Today's Visits, Mobile device share
  - Top Cities & States ranking with country flag badges (e.g. 🇮🇳 Varanasi, New Delhi, Mumbai, Lucknow)
  - Interactive Chart.js device and platform breakdown (Desktop vs Mobile vs Tablet)
  - Real-time detailed traffic stream table displaying IP, City, State, Page visited, Device, Browser, Referrer, and exact Timestamp
  - 1-click Clear History option
- [x] Connected Visitor Geolocation summary strip & shortcut to main Admin Dashboard (`/admin`)

## Phase 9: Fleet Stock, GPS Dispatch, 5-Slide Carousels, Interactive Roadmap & Hardening
- [x] Real-Time Fleet Stock (`vehicles.total_quantity`) & `GET /booking/availability` live stock check + auto-release on `COMPLETED`/`CANCELLED`
- [x] Cab + Hotel Combo integration in both `/booking/car` and `/booking/hotel`
- [x] HTML5 Live GPS pickup detection (`bookings.pickup_coords`) & 1-click Google Maps + WhatsApp Driver Dispatch in `/admin/bookings`
- [x] Public Customer Review submission (`POST /reviews/submit`) & modal on Homepage
- [x] 5-Slide Vehicle Carousels (`vehicles.gallery_images`) across Rental Rates, Fleet Gallery, and Cab Details Modal (`1/5` badge, high-contrast `X` close button) + Admin multi-file slide upload
- [x] Hero transparency & frosted glass Quick Booking widget + full viewport height restoration
- [x] 11-Stop Zigzag Varanasi Pilgrimage Roadmap (Hero to Reviews) in outer page margins (*Sarnath* to *ISKCON Temple*) with hover detail cards
- [x] Active & hover navbar link underline, transparent subpage banners, and high-contrast footer bottom bar
- [x] Security & Performance Audit: SQLite WAL mode, rate limiting on all submission routes, sanitized global error handler, dead code removal (`fleetGallery`, `layout.ejs`), shared helpers (`db.parseVehicleSlides`, `getVehicleAvailability`), and lightweight `IntersectionObserver` scroll-reveal animations


