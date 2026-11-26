const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Home page
router.get('/', async (req, res, next) => {
  try {
    const [attractions, vehicles, packages, reviews] = await Promise.all([
      db.all('SELECT * FROM attractions ORDER BY distance_km ASC'),
      db.all('SELECT * FROM vehicles ORDER BY local_base_rate ASC'),
      db.all('SELECT * FROM packages ORDER BY price ASC'),
      db.all('SELECT * FROM reviews WHERE status = "APPROVED" ORDER BY id DESC LIMIT 6')
    ]);

    vehicles.forEach(v => {
      v.slides = db.parseVehicleSlides(v);
    });

    res.render('index', {
      title: 'Varanasi Tour & Travels | Car Booking & Kashi Yatra',
      activePage: 'home',
      attractions,
      vehicles,
      packages,
      reviews,
      reviewSuccess: req.query.review_success === '1'
    });
  } catch (err) {
    next(err);
  }
});

// Submit Customer Review
router.post('/reviews/submit', async (req, res, next) => {
  try {
    const { customer_name, rating, trip_type, comment } = req.body;
    if (!customer_name || !comment) {
      return res.redirect('/#testimonials');
    }

    await db.run(
      'INSERT INTO reviews (customer_name, rating, trip_type, comment, status) VALUES (?, ?, ?, ?, ?)',
      [
        customer_name.trim(),
        parseInt(rating) || 5,
        trip_type ? trip_type.trim() : 'Varanasi Pilgrimage Trip',
        comment.trim(),
        'APPROVED'
      ]
    );

    res.redirect('/?review_success=1#testimonials');
  } catch (err) {
    next(err);
  }
});

// Distance Chart page
router.get('/distance-chart', (req, res) => {
  res.render('distance_chart', {
    title: 'Varanasi Distance Chart | Sightseeing & Outstation Routes',
    activePage: 'distance'
  });
});

module.exports = router;
