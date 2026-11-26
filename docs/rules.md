# Development Guidelines & Engineering Rules

## 1. Code Standards & Conventions
- **Clean Node.js**: Use modern ES6+ JavaScript syntax (`async/await`, destructuring, arrow functions).
- **Express.js Patterns**:
  - Keep controllers thin and route handlers clean.
  - Consistent error handling: always wrap async route calls in try/catch or helper error boundaries.
  - Return meaningful HTTP status codes (200, 201, 400, 404, 500).
- **Database Rules**:
  - Always use parameterized SQL queries (`?`) to prevent SQL injection vulnerabilities.
  - Keep schema migrations idempotent (`CREATE TABLE IF NOT EXISTS`).
  - Provide fallback default values for optional fields.
- **EJS Template Rules**:
  - Use modular partials (`header.ejs`, `footer.ejs`) to avoid duplication.
  - HTML escape user data by default (`<%= var %>`), use `<%- var %>` only for trusted pre-sanitized HTML.
  - Keep view logic minimal (formatting, loops, simple conditionals).

## 2. UI/UX Rules
- **Varanasi Cultural Theme**:
  - Primary color palette should resonate with spiritual Varanasi: Deep Navy/Royal Blue `#0f2b48`, Sacred Saffron/Gold `#f59e0b` / `#d97706`, and clean neutral backgrounds `#f8fafc`.
  - Contrast ratios must comply with accessibility (WCAG AA).
- **Mobile First**:
  - Navigation menus must collapse gracefully on screens `< 768px`.
  - Floating WhatsApp and Click-to-Call buttons must remain visible and accessible on mobile.
- **Data Transparency**:
  - Every attraction card must explicitly display distance in kilometers and entry cost (or clearly state "Free Entry").
  - Every car booking card must explicitly state luggage capacity, seating, and per-km / 8hr base rates without hidden charges.

## 3. Security & Validation
- **Form Inputs**:
  - Validate phone numbers (10 digits) and email formats on both client-side and server-side.
  - Validate date inputs to ensure bookings cannot be made in the past.
- **Admin Protection**:
  - Protect `/admin` dashboard routes with session/cookie basic authentication.
  - Mask customer contact details in logs.

## 4. Performance & Portability
- **Self-contained**: Do not depend on fragile native addons where standard lightweight alternatives work seamlessly on Windows and Linux.
- **Clean Assets**: Use stable CDN links for Bootstrap 5 and FontAwesome 6, ensuring fast caching and zero local binary build requirements.
