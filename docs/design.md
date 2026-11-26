# Design System & UI/UX Specification

## 1. Brand Identity & Visual Language
Inspired by Varanasi's spiritual heritage, Ganga ghats, and high-converting tour portals like *Varanasi Travels* and *Varanasi Yatraa*:
- **Primary Color**: `#0c2340` (Kashi Night / Deep Sacred Blue) - Used for navbar, headings, major CTA buttons.
- **Accent Color**: `#f59e0b` & `#ea580c` (Saffron Gold & Temple Sunset) - Used for badges, highlights, CTA accents, ratings.
- **Secondary Color**: `#10b981` (WhatsApp Emerald Green) - Used for direct WhatsApp booking actions.
- **Background**: `#f8fafc` (Soft Off-White) with pure `#ffffff` cards and subtle borders `#e2e8f0`.
- **Typography**: Clean modern sans-serif (`Inter`, `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`).

## 2. Page Specifications

### Page 1: Header & Navigation
- **Top Bar**: Contact phone numbers, email, and 24x7 Support badge.
- **Main Nav**:
  - Brand Logo: "Varanasi Travels" with bold saffron tagline (`KASHI TOUR & CAB BOOKING`).
  - Links: Home, Visiting Places, Tour Packages, Car Rental, Hotels, Distance Chart, Contact Us — with smooth saffron underline on both `:hover` and `.active` page state.
  - Action Button: "Book Now" (Highlight button).

### Page 2: Homepage (`/`)
1. **Hero Section**:
   - Full-viewport hero slider (`min-height: calc(100vh - 105px)`) with crystal-clear transparent overlay and trust stats (`84+`, `5,000+`, `100%`).
   - Frosted-glass Quick Booking Widget (`backdrop-filter: blur(8px)`).
2. **11-Stop Interactive Varanasi Roadmap**:
   - Organic wavy orange dotted route flowing behind sections from Hero down to Reviews.
   - 11 outer-margin landmark pins (*Sarnath* to *ISKCON Temple*) with icons and hover detail cards.
3. **Featured Tour Packages & Visiting Places Preview**:
   - Modular cards with GPU-accelerated hover lift and scroll-reveal animations.
4. **Car Rental Fleet & Gallery (5-Slide Carousels)**:
   - Vehicles: Swift Dzire, Maruti Ertiga, Toyota Innova Crysta, Force Tempo Traveller.
   - Clean 5-slide carousels with `1/5` corner badges, zero side-arrow clutter, and high-contrast modal close `(X)` button.
5. **Customer Testimonials & Public Review Modal**:
   - Real reviews + public "Write a Review" modal.
6. **Footer**:
   - High-contrast (`#e2e8f0`) copyright & rating bottom bar + floating WhatsApp pill.

### Subpage Banners (`/attractions`, `/packages`, `/booking/car`, `/booking/hotel`, `/distance-chart`, `/contact`)
- Transparent glass tint (`rgba(15, 23, 42, 0.32)`) with crisp `text-shadow` so background photography remains clearly visible.

### Page 3: Attractions Directory (`/attractions`)
- Filter tabs: `All`, `Temples`, `Ghats`, `Heritage & Forts`, `Excursions (Sarnath/Ramnagar)`.
- Cards with high-resolution imagery, distance tag, estimated travel time, entry fee, opening hours, dress codes, and "Book Cab to This Place" button.
- Detailed modal / page for each place with rich historical background.

### Page 4: Tour Packages (`/packages`)
- Comprehensive itineraries: Day-by-day plan, inclusions (AC Cab, Boat Ride, Tolls, Guide), exclusions, pricing table based on group size.

### Page 5: Car Booking Wizard (`/booking/car`)
- Dynamic trip calculator:
  - Radio options: Local Sightseeing (8h/80km) vs Outstation Tour vs Airport Pickup/Drop.
  - Checkbox list of attractions to visit (auto-sums recommended trip distance).
  - Live total cost estimation.
  - Customer booking form: Name, Phone, Email, Pickup address, Travel date & time.
  - Mock Payment checkout or "Pay Cash to Driver upon arrival".

### Page 6: Hotel Booking (`/booking/hotel`)
- Filter by proximity to Ghats / Vishwanath Corridor.
- Highlighting amenities: AC, WiFi, Pure Veg Restaurant, Hot Water, Ganga View terrace.
- Direct room reservation form with instant confirmation.

### Page 7: Distance Chart (`/distance-chart`)
- Comprehensive tabular distance chart inspired by `varanasitravels.com` and `varanasiyatraa.com`.
- Highlights Varanasi to:
  - Prayagraj Triveni Sangam (125 km)
  - Ayodhya Ram Mandir (215 km)
  - Bodhgaya Mahabodhi Temple (250 km)
  - Vindhyachal Devi Mandir (70 km)
  - Sarnath Deer Park (10 km)
  - Lal Bahadur Shastri International Airport Babatpur (26 km)
  - Deva Sharif / Naimisharanya (320 km)
- Includes recommended vehicle types and typical driving hours.

### Page 8: Contact Us (`/contact`)
- Google Map embed placeholder, office location, emergency numbers, WhatsApp chat, and feedback/custom inquiry form.

### Floating Sticky Elements
- Floating WhatsApp icon at bottom right for 1-click mobile chat.
- Mobile bottom sticky action bar with "Call Now" and "Book Cab".
