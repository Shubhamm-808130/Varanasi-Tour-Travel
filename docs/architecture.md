# System Architecture Document

## 1. Architectural Style
Multi-Page Application (MPA) rendered server-side using **Node.js (Express.js)** and **EJS (Embedded JavaScript)** templates with **SQLite** for relational storage. 

```
┌────────────────────────────────────────────────────────┐
│                     Client Browser                     │
│  (HTML5, CSS3, Bootstrap 5, FontAwesome, Vanilla JS)   │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP / HTTPS (SSR & Form Submissions)
┌───────────────────────────▼────────────────────────────┐
│                    Express.js Server                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    Middleware                    │  │
│  │  - helmet, express-rate-limit, cookie-parser     │  │
│  │  - geoTracker, cached site_settings, static (1d) │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │                     Routers                      │  │
│  │  - routes/index.js        (Home, Reviews, Chart) │  │
│  │  - routes/attractions.js  (Sightseeing places)   │  │
│  │  - routes/packages.js     (Tour packages)        │  │
│  │  - routes/booking.js      (Car, Hotel & Stock)   │  │
│  │  - routes/contact.js      (Inquiry submissions)  │  │
│  │  - routes/admin.js        (Protected Admin)      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  View Engine                     │  │
│  │  - Modular EJS (partials/header & footer + views)│  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────▲────────────────────────────┘
                            │ SQLite Driver (sqlite3 - WAL Mode)
┌───────────────────────────▼────────────────────────────┐
│                  SQLite Database (data/tour.db)        │
│  - attractions, vehicles (+total_quantity, gallery)    │
│  - packages, hotels, bookings (+pickup_coords)         │
│  - inquiries, reviews, site_settings, admins, visitors │
└────────────────────────────────────────────────────────┘
```

## 2. Directory Structure
```
varanasi-tour/
├── data/
│   └── tour.db              # SQLite persistent database file
├── docs/
│   ├── prd.md               # Product Requirements
│   ├── architecture.md      # Architecture specification
│   ├── rules.md             # Development & coding standards
│   ├── design.md            # UI/UX design & style guide
│   ├── tasks.md             # Implementation tasks & checklist
│   └── memory.md            # Decision log & context memory
├── models/
│   ├── db.js                # Database connection & schema migration
│   └── seed.js              # Initial data seed (attractions, cars, hotels, packages)
├── public/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   └── main.js          # Client-side fare calculators, modals, interactive filters
│   └── images/              # Local fallbacks and icons
├── routes/
│   ├── index.js             # Home, About, Distance Chart
│   ├── attractions.js       # Attractions listing and details
│   ├── packages.js          # Tour package routes
│   ├── booking.js           # Car and Hotel reservation logic
│   ├── contact.js           # Contact form and inquiry handling
│   └── admin.js             # Admin login, booking management, and CRUD
├── views/
│   ├── partials/
│   │   ├── header.ejs       # Topbar, contact info, brand, navigation
│   │   └── footer.ejs       # Footer with quick links, contact, social, WhatsApp pill
│   ├── index.ejs            # Homepage
│   ├── attractions.ejs      # Attractions & visiting places directory
│   ├── attraction_detail.ejs# Single attraction detail view
│   ├── packages.ejs         # Tour packages listing
│   ├── package_detail.ejs   # Tour package itinerary & booking
│   ├── car_booking.ejs      # Car booking wizard & tariff calculator
│   ├── hotel_booking.ejs    # Hotel booking & room selection
│   ├── distance_chart.ejs   # Varanasi distance chart table
│   ├── contact.ejs          # Contact form & location info
│   ├── booking_success.ejs  # Confirmation receipt with Reference ID
│   └── admin/
│       ├── login.ejs        # Admin authentication
│       └── dashboard.ejs    # Booking & inquiry management
├── package.json
├── server.js
└── README.md
```

## 3. Data Schema
1. **`attractions`**:
   - `id` INTEGER PK AUTOINCREMENT
   - `name` TEXT NOT NULL
   - `category` TEXT (Ghat / Temple / Heritage / Excursion)
   - `distance_km` REAL (Distance from Cantt / City Centre)
   - `travel_time` TEXT (e.g. "20 mins")
   - `entry_fee` REAL (0 for free)
   - `timings` TEXT (e.g. "03:00 AM - 11:00 PM")
   - `best_time` TEXT (e.g. "Early morning / Evening Aarti")
   - `description` TEXT
   - `image_url` TEXT
   - `location` TEXT

2. **`vehicles`**:
   - `id` INTEGER PK AUTOINCREMENT
   - `name` TEXT (e.g. "Swift Dzire / Toyota Etios")
   - `category` TEXT (Sedan / SUV / MUV / Tempo Traveller)
   - `capacity` INTEGER (4 / 6 / 7 / 12)
   - `ac` INTEGER (1 or 0)
   - `luggage_capacity` INTEGER
   - `local_base_rate` REAL (8hr / 80km package)
   - `outstation_rate_per_km` REAL (per-km rate)
   - `airport_transfer_rate` REAL (Airport pick/drop)
   - `image_url` TEXT

3. **`packages`**:
   - `id` INTEGER PK AUTOINCREMENT
   - `title` TEXT
   - `duration` TEXT (e.g. "Same Day", "2 Nights / 3 Days")
   - `price` REAL
   - `highlights` TEXT
   - `itinerary` TEXT
   - `inclusions` TEXT
   - `image_url` TEXT

4. **`hotels`**:
   - `id` INTEGER PK AUTOINCREMENT
   - `name` TEXT
   - `category` TEXT (Luxury / 3-Star Deluxe / Ghat-side Heritage / Budget)
   - `price_per_night` REAL
   - `rating` REAL (e.g. 4.8)
   - `distance_to_ghat` TEXT (e.g. "200 meters from Dashashwamedh")
   - `amenities` TEXT (AC, WiFi, Ganga View, Breakfast, Lift)
   - `image_url` TEXT

5. **`bookings`**:
   - `id` INTEGER PK AUTOINCREMENT
   - `booking_type` TEXT (CAR / HOTEL / PACKAGE)
   - `booking_ref` TEXT UNIQUE (e.g. "KASHI-2026-XXXX")
   - `customer_name` TEXT NOT NULL
   - `customer_email` TEXT NOT NULL
   - `customer_phone` TEXT NOT NULL
   - `service_date` TEXT NOT NULL
   - `pickup_location` TEXT
   - `drop_location` TEXT
   - `vehicle_id` INTEGER
   - `hotel_id` INTEGER
   - `package_id` INTEGER
   - `passengers` INTEGER
   - `selected_attractions` TEXT
   - `total_amount` REAL
   - `payment_status` TEXT (PENDING / PAID_MOCK / PAY_ON_ARRIVAL)
   - `booking_status` TEXT (CONFIRMED / PENDING / COMPLETED / CANCELLED)
   - `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

6. **`inquiries`**:
   - `id` INTEGER PK AUTOINCREMENT
   - `name` TEXT NOT NULL
   - `email` TEXT NOT NULL
   - `phone` TEXT NOT NULL
   - `subject` TEXT
   - `message` TEXT NOT NULL
   - `status` TEXT DEFAULT 'NEW'
   - `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
