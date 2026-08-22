const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { createRental, calculatePriceAndAvailability } = require('../controllers/rentalsController');

const router = express.Router();

router.post('/calculate', calculatePriceAndAvailability); // POST /api/rentals/calculate - Check availability & price (No auth required)
router.post('/', authenticateToken, createRental); // POST /api/rentals - create a rental booking

module.exports = router;