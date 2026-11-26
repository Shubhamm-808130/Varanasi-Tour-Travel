# Varanasi Tour & Travel Website

A full-featured multi-page web portal & Admin Control Suite for showcasing Varanasi's temples and ghats, real-time cab fleet availability, curated tour packages, and Cab + Hotel combo bookings.
Built with **Node.js (Express)**, **EJS** server-side rendering, **SQLite (WAL Mode)**, and **BCrypt + Helmet + Rate-Limiting** enterprise security.

## Project Structure
```
varanasi-tour/
├─ data/
│   └─ tour.db                # SQLite persistent database (WAL Mode)
├─ docs/                      # Architecture, PRD, Design, Rules, Tasks & Memory
├─ models/
│   ├─ db.js                  # SQLite connection, WAL mode, schema migrations & shared helpers
│   └─ seed.js                # Initial seed data
├─ public/
│   ├─ css/
│   │   ├─ style.css          # Public theme, zigzag roadmap, 5-slide carousels & animations
│   │   └─ admin-layout.css   # Admin sidebar & dashboard styles
│   ├─ js/
│   │   └─ main.js            # Fare calculator, stock checker, slider & IntersectionObserver reveal
│   └─ images/                # Static & uploaded vehicle/media images
├─ routes/
│   ├─ index.js               # Home, distance chart & public customer reviews
│   ├─ attractions.js         # Attractions directory & detail pages
│   ├─ packages.js            # Tour packages listing & itinerary views
│   ├─ booking.js             # Car/Hotel/Combo booking wizard & real-time stock API
│   ├─ contact.js             # Contact & custom inquiry submission
│   └─ admin.js               # Protected Admin Portal (BCrypt + Signed HttpOnly Cookie)
├─ utils/
│   ├─ geoTracker.js          # Offline IP geolocation & device/browser analytics
│   └─ uploader.js            # Multer safe image upload (extension/MIME whitelist)
├─ views/
│   ├─ partials/
│   │   ├─ header.ejs         # Topbar, brand & navbar with active/hover underline
│   │   └─ footer.ejs         # High-contrast footer & floating WhatsApp pill
│   ├─ index.ejs              # Hero slider, 11-stop zigzag roadmap, rates, 5-slide carousels & reviews
│   ├─ attractions.ejs        # Sightseeing directory with transparent banner
│   ├─ packages.ejs           # Tour packages with transparent banner
│   ├─ car_booking.ejs        # Car + Hotel combo wizard, live GPS & stock availability
│   ├─ hotel_booking.ejs      # Hotel + Cab combo wizard
│   ├─ distance_chart.ejs     # Varanasi pilgrimage distance guide
│   ├─ contact.ejs            # Contact & inquiry page
│   ├─ booking_success.ejs    # Confirmation receipt
│   └─ admin/                 # Full Admin Suite (dashboard, bookings, vehicles, visitors, etc.)
└─ server.js                  # Express server with Helmet, Rate Limiting & Settings Cache
```

## Getting Started
1. **Install Node.js** (≥ 20).  
2. Open a terminal and navigate to the project folder:
   ```bash
   cd C:\Users\HP\.gemini\antigravity\scratch\varanasi-tour
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the server:
   ```bash
   npm start
   ```
   - Public Portal: `http://localhost:3000`
   - Admin Portal: `http://localhost:3000/admin`

## Key Implemented Features
- **5-Slide Vehicle Carousels & Modal Viewer**: Every vehicle displays up to 5 photos (`1/5` badge) across Rental Rates, Photo Gallery, and high-contrast Cab Details Modal, manageable via Admin multi-image upload.
- **11-Stop Interactive Varanasi Roadmap**: Wavy orange dotted route from Hero down to Reviews with outer-margin pins (*Sarnath* to *ISKCON Temple*) and hover detail boxes.
- **Real-Time Fleet Stock & Cab+Hotel Combo**: Live availability checking (`GET /booking/availability`), automatic stock release on trip completion/cancellation, and Live GPS pickup coordinates (`pickup_coords`) with 1-click Google Maps driver dispatch.
- **Security & Performance**: SQLite WAL mode, in-memory `site_settings` cache, `bcryptjs` auth, `helmet` headers, `express-rate-limit` on all login/submission routes, and GPU-accelerated scroll-reveal animations.
