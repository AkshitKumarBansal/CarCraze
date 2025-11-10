const express = require('express');
const Rental = require('../models/Rental');
const Car = require('../models/Car');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/rentals - create a rental booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Customer access required' });
    }

    const { carId, startDate, endDate } = req.body;
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: 'carId, startDate and endDate are required' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    if (car.listingType !== 'rent') return res.status(400).json({ message: 'Car is not available for rent' });

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e <= s) return res.status(400).json({ message: 'Invalid rental dates' });

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((e - s) / msPerDay);
    const pricePerDay = car.price || 0;
    const totalAmount = pricePerDay * days;

    const rental = new Rental({
      car: car._id,
      customer: req.user.userId,
      startDate: s,
      endDate: e,
      pricePerDay,
      totalAmount
    });

    await rental.save();

    // Optionally, update car availability - for now we leave it as-is but log
    console.log('Rental created:', rental._id);
    res.status(201).json({ message: 'Rental booked successfully', rental });
  } catch (err) {
    console.error('Create rental error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
