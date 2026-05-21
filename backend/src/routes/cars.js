const express = require('express');
const Car = require('../models/Car');
const Review = require('../models/Review');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/cars — all active cars
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    let query = { status: 'active' };

    if (lat && lng && radius) {
      query.locationGeo = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      };
    }

    const cars = await Car.find(query).lean();
    res.json({ cars });
  } catch (err) {
    console.error('Get cars error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cars/:id — single car with seller info
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('sellerId', 'firstName lastName email phone businessInfo rating')
      .lean();
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ car });
  } catch (err) {
    console.error('Get car by ID error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cars/:id/reviews — get reviews for a car
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.id })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/cars/:id/reviews — add a review for a car
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // Prevent multiple reviews from same user
    const existingReview = await Review.findOne({ car: req.params.id, user: req.user.userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this car' });
    }

    const review = new Review({
      car: req.params.id,
      user: req.user.userId,
      rating,
      comment
    });

    await review.save();
    await review.populate('user', 'firstName lastName');

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/cars/:id/check-delivery — verify if user is inside delivery zone
router.post('/:id/check-delivery', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const config = car.deliveryConfig;
    if (!config || config.type === 'anywhere') {
      return res.json({ eligible: true, message: 'Delivery available anywhere' });
    }
    if (config.type === 'pickup') {
      return res.json({ eligible: false, message: 'This car is pickup only' });
    }

    const userPoint = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };

    if (config.type === 'radius' && config.radiusKm && car.locationGeo) {
      const isWithin = await Car.exists({
        _id: car._id,
        locationGeo: {
          $near: {
            $geometry: userPoint,
            $maxDistance: config.radiusKm * 1000
          }
        }
      });
      if (isWithin) {
        return res.json({ eligible: true, message: `Within ${config.radiusKm}km delivery radius` });
      } else {
        return res.json({ eligible: false, message: `Outside ${config.radiusKm}km delivery radius` });
      }
    }

    if (config.type === 'polygon' && config.polygon && config.polygon.coordinates) {
      const intersects = await Car.exists({
        _id: car._id,
        'deliveryConfig.polygon': {
          $geoIntersects: {
            $geometry: userPoint
          }
        }
      });
      
      if (intersects) {
        return res.json({ eligible: true, message: 'Inside custom delivery zone' });
      } else {
        return res.json({ eligible: false, message: 'Outside custom delivery zone' });
      }
    }

    return res.json({ eligible: true, message: 'Delivery eligibility verified' });
  } catch (err) {
    console.error('Check delivery error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;