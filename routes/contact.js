const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Contact page
router.get('/', (req, res) => {
  res.render('contact', {
    title: 'Contact Us | Varanasi Tour & Travels Helpline',
    activePage: 'contact',
    success: req.query.success === '1'
  });
});

// Submit contact / inquiry form
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, travel_date, subject, message } = req.body;

    await db.run(
      `INSERT INTO inquiries (name, email, phone, travel_date, subject, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'NEW')`,
      [name, email, phone, travel_date || null, subject || 'General Tour Inquiry', message]
    );

    res.redirect('/contact?success=1');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
