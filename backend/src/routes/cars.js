const express = require('express');
const Car = require('../models/Car');

const router = express.Router();

// GET /api/cars
router.get('/', async (_req, res) => {
  try {
    const cars = await Car.find({ status: 'active' }).lean();
    res.json({ cars });
  } catch (err) {
    console.error('Get cars error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;