const express = require('express');
const router = express.Router();
const db = require('../models/db');

// List all attractions
router.get('/', async (req, res, next) => {
  try {
    const attractions = await db.all('SELECT * FROM attractions ORDER BY distance_km ASC');
    res.render('attractions', {
      title: 'Visiting Places in Varanasi | Distance, Cost & Timings',
      activePage: 'attractions',
      attractions
    });
  } catch (err) {
    next(err);
  }
});

// Single attraction detail
router.get('/:id', async (req, res, next) => {
  try {
    const place = await db.get('SELECT * FROM attractions WHERE id = ?', [req.params.id]);
    if (!place) {
      return res.status(404).send('Attraction not found');
    }
    res.render('attraction_detail', {
      title: `${place.name} - Timings, Distance & Cost`,
      activePage: 'attractions',
      place
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
