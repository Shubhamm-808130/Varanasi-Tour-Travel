const express = require('express');
const router = express.Router();
const db = require('../models/db');

// List all packages
router.get('/', async (req, res, next) => {
  try {
    const packages = await db.all('SELECT * FROM packages ORDER BY price ASC');
    res.render('packages', {
      title: 'Varanasi Tour Packages | Kashi Darshan & Ayodhya Tours',
      activePage: 'packages',
      packages
    });
  } catch (err) {
    next(err);
  }
});

// Single package detail
router.get('/:id', async (req, res, next) => {
  try {
    const pkg = await db.get('SELECT * FROM packages WHERE id = ?', [req.params.id]);
    if (!pkg) {
      return res.status(404).send('Tour package not found');
    }
    res.render('package_detail', {
      title: `${pkg.title} - Itinerary & Booking`,
      activePage: 'packages',
      pkg
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
