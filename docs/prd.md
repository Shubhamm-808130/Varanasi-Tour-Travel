# Product Requirements Document (PRD)
## Project: Varanasi Tour & Travel Web Portal (Kashi Yatra & Cab Booking)

### 1. Overview & Vision
A comprehensive, multi-page web application providing tourists and pilgrims with an authentic, reliable, and hassle-free Varanasi travel experience. The platform combines:
- **Comprehensive Varanasi Sightseeing Guide**: Complete details for temples, ghats, and historical monuments (distance from city centre, entry cost, aarti timings, best visiting hours, spiritual significance).
- **Tour Packages**: Pre-crafted itineraries (Kashi Darshan, Subah-e-Banaras Boat Tour, Varanasi-Prayagraj-Ayodhya Golden Triangle, Bodhgaya Tour, Dev Deepawali special).
- **Online Car & Taxi Booking Wizard**: Local 8hr/80km packages, outstation per-km rentals, and airport/station pick & drop with instant fare estimation.
- **Partner Hotel Booking**: Budget to luxury accommodations categorized by proximity to Ghats and Vishwanath Temple Corridor.
- **Direct Contact & Quick WhatsApp Inquiry**: Instant customer support channel.
- **Admin Control Panel**: Manage bookings, inquiries, fleet, and attraction data.

### 2. Competitive Benchmark Analysis
Based on in-depth review of leading regional portals:
1. **Varanasi Travels (`varanasitravels.com`)**: Strong emphasis on taxi rental tariffs, comprehensive distance charts, multi-day spiritual circuit packages (Ayodhya, Prayagraj, Gaya).
2. **Kashi Voyages Tours (`kashivoyagestours.com`)**: Focus on curated guided experiences, boat ride bookings (morning subah-e-banaras, evening ganga aarti), reliable cab fleet.
3. **Varanasi Tourism (`varanasi-tourism.in`)**: Detailed attraction directories, temple opening/closing schedules, entry fees, and route guidance.
4. **Varanasi Yatraa (`varanasiyatraa.com`)**: Clean modern UI, quick booking modal, floating WhatsApp CTA, transparent package pricing, and hotel partnerships.

### 3. Core Functional Requirements
- **FR-1: Home Page**:
  - Top emergency bar with phone, email, WhatsApp, and operating hours.
  - Hero banner with tour search / quick booking CTA.
  - Featured tour packages with duration, price, and "View Details / Book" button.
  - Popular tourist attractions grid with distance badges and entry fee.
  - Cab fleet showcase (Dzire, Ertiga, Innova Crysta, Tempo Traveller) with day and per-km tariffs.
  - Why Choose Us (Local verified drivers, 24/7 assistance, no hidden charges).
  - Customer reviews and testimonials.
- **FR-2: Attractions & Places Directory (`/attractions`)**:
  - Filter by category: Ghats, Temples, Heritage & History, Excursions (Sarnath, Ramnagar).
  - Place card details: Name, image, distance from Cantt Station/City Centre, travel time, entry fees, dress code/special tips.
  - Interactive distance calculator and modal for place details.
- **FR-3: Tour Packages (`/packages`)**:
  - Day tours (Morning Boat Ride + Kashi Darshan), 2N/3D Varanasi complete, 4N/5D Varanasi - Prayagraj - Ayodhya.
  - Included/Excluded breakdown, itinerary timeline, and instant booking modal.
- **FR-4: Car & Taxi Booking Wizard (`/booking/car`)**:
  - Step 1: Trip type (Local 8hr/80km, Airport Transfer, Outstation per-km, or Custom Sightseeing).
  - Step 2: Vehicle selection with seat count, luggage capacity, and base rate.
  - Step 3: Optional sightseeing places selection (with auto distance & fare recalculation).
  - Step 4: Pick-up date, time, address, and passenger details.
  - Step 5: Transparent fare summary with mock checkout / Pay on Arrival option.
- **FR-5: Hotel Booking (`/booking/hotel`)**:
  - Partner hotels categorized: Heritage Ghat-side Haveli, 3-Star Deluxe, 4-Star Luxury.
  - Price per night, distance to Ghats, amenities list (AC, WiFi, Ganga view, Breakfast).
  - Booking request form with check-in, check-out, and guest counts.
- **FR-6: Distance & Route Chart (`/distance-chart`)**:
  - Clear distance table between Varanasi and major pilgrimage hubs (Prayagraj: 125km, Ayodhya: 215km, Bodhgaya: 250km, Sarnath: 10km, etc.).
- **FR-7: Contact & Custom Itinerary (`/contact`)**:
  - Contact form with name, email, phone, number of days, and message.
  - Direct WhatsApp button (`wa.me`) and instant call links (`tel:`).
- **FR-8: Admin Panel (`/admin`)**:
  - Protected dashboard to view, approve, and filter bookings (Car, Hotel, Combo, Inquiries, Reviews, Visitors).
  - Manage vehicles with fleet stock (`total_quantity`) and up to 5 slide photos (`gallery_files` / `gallery_urls`), attractions, packages, and global settings.
  - 1-click Google Maps pin view and WhatsApp Driver Dispatch for bookings with Live GPS coordinates.
- **FR-9: Real-Time Fleet Availability & Combo Reservations**:
  - Live per-date vehicle stock checker (`GET /booking/availability`) preventing overbooking and auto-restoring availability on trip completion/cancellation.
  - Integrated Cab + Hotel combo booking in both `/booking/car` and `/booking/hotel`.
- **FR-10: Interactive Varanasi Roadmap & Multi-Slide Carousels**:
  - 11-stop zigzag Varanasi pilgrimage roadmap with hover detail cards.
  - 5-slide interactive carousels (`1/5` badge) on vehicle cards, photo gallery, and modal viewer.

### 4. Non-Functional Requirements
- **Technology Stack**: Node.js, Express.js, EJS templates, SQLite database.
- **Mobile First & Responsive**: Seamless experience on smartphones, tablets, and desktops using Bootstrap 5 and custom CSS.
- **SEO & Social Sharing**: Meaningful meta tags, OpenGraph tags, semantic HTML5.
- **Performance**: Instant page loads, zero heavy external build steps required.
