# Project Memory & Decision Log

## Architecture & Technology Decisions
1. **Multi-Page Site (MPA) Architecture**:
   - Chosen over Single Page App (SPA) per explicit user requirement (`do with multi-page site`).
   - Enables fast initial page loads, optimal SEO for individual Varanasi attractions, and simple server-side rendering with EJS.

2. **Backend & Framework**:
   - Selected **Node.js with Express.js** based on user clarification.
   - Using standard `sqlite3` for cross-platform zero-configuration local database persistence.

3. **Payment Flow**:
   - Selected **Mock Payment Flow / Pay on Arrival** prototype model per user selection. Bookings generate a unique reference token (`KASHI-2026-XXXX`) with status `PAID_MOCK` or `PAY_ON_ARRIVAL`. Ready for Stripe/Razorpay plug-in at any time.

4. **Benchmark Websites Researched & Emulated**:
   - `varanasitravels.com`: Adopted explicit distance charts, car rental fare slabs, and regional circuit tour routes (Ayodhya, Prayagraj, Gaya).
   - `kashivoyagestours.com`: Adopted specialized boat tours, morning aarti experiences, and spiritual darshan packages.
   - `varanasi-tourism.in`: Adopted rich visiting places data structure (timings, dress code, entry fees, and distance from Cantt station).
   - `varanasiyatraa.com`: Adopted modern high-converting UI components (top contact bar, floating WhatsApp pill, clean card-based car fleet, and instant booking modal).

5. **Theme & Palette**:
   - Deep Royal Navy `#0c2340`, Sacred Saffron Gold `#f59e0b`, Sunset Orange `#ea580c`, and Emerald WhatsApp `#10b981`.

6. **Laddoo Admin Architecture Adoption**:
   - Examined `c:\xampp\htdocs\Laddoo\Admin` and adapted its e-commerce control paradigm directly into the Tour & Travel domain.
   - Built collapsible dark sidebar (`admin-layout.css`), live digital clock, pulsating active status badge, gradient stat cards, Chart.js trend curves, and modular tabs for Cabs, Packages, Distances, Bookings, Inquiries, Reviews, Media, Settings, and Profile.

7. **Security Architecture**:
   - Cryptographic password security using `bcryptjs` (salt 10 rounds).
   - Anti-bruteforce protection with `express-rate-limit` (10 tries/15 mins on login, 30 requests/15 mins on public forms).
   - Clickjacking and MIME-sniffing protection using `helmet` headers.
   - Strict upload validation with `multer` verifying file extension and MIME types, with randomized filenames preventing directory traversal.
   - 100% Parameterized SQL queries to eliminate SQL injection vulnerabilities.

8. **Real-Time Visitor Geolocation & Device Analytics**:
   - Implemented `geoip-lite` with fallback for private/local subnets.
   - User-Agent parser identifies device type (`Mobile`, `Tablet`, `Desktop`), browser, and OS.
   - Dedicated `/admin/visitors` dashboard view with rankings for top cities, states, platforms, and a detailed 100-hit audit table with timestamps.

9. **Fleet Stock, GPS Dispatch, Multi-Slide Carousels & Performance Hardening**:
   - Added `vehicles.total_quantity` & `GET /booking/availability` real-time stock checker, auto-releasing stock when bookings are `COMPLETED` or `CANCELLED`.
   - Added `vehicles.gallery_images` JSON array (max 5 slides per car) with `db.parseVehicleSlides()`, rendered across Rental Cards, Gallery, and Cab Details Modal (`1/5` counter, zero side-arrow clutter, high-contrast close `X` button), plus multi-file upload in `/admin/vehicles`.
   - Added HTML5 Live GPS (`bookings.pickup_coords`) with 1-click Google Maps driver dispatch in Admin Bookings.
   - Built an 11-stop wavy zigzag Varanasi pilgrimage roadmap in the outer page margins (from Hero down to Reviews) with hover detail cards, active/hover navbar underlines, and transparent subpage banners.
   - Enabled SQLite `WAL` mode, 60-second `site_settings` cache, sanitized error handler, complete route rate-limiting, and GPU-accelerated scroll-reveal animations (`IntersectionObserver`).


