const express = require('express');
const { readCars } = require('../services/fileDb');

const router = express.Router();

// GET /api/cars
router.get('/', async (_req, res) => {
  try {
    const cars = await readCars();
    const activeCars = cars.filter((c) => c.status === 'active');
    res.json({ cars: activeCars });
  } catch (err) {
    console.error('Get cars error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;