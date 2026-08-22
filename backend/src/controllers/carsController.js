const Car = require('../models/Car');
const Review = require('../models/Review');
const turf = require('@turf/turf');

// Controller function to get all active cars, optionally filtered by location and radius
const getAllCars = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    let cars = await Car.find({ status: 'active' }).lean();
    if (lat && lng && radius) {
      const userPoint = turf.point([parseFloat(lng), parseFloat(lat)]);
      const searchRadius = parseFloat(radius);
      cars = cars.filter(car => {
        if (!car.locationGeo || !car.locationGeo.coordinates) {
          return false;
        }
        const carPoint = turf.point(car.locationGeo.coordinates);
        const distance = turf.distance(userPoint, carPoint, { units: 'kilometers' });
        return distance <= searchRadius;
      });
    }
    res.json({ cars });
  } catch (err) {
    console.error('Get cars error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to get a single car by ID, including seller information
const getCarById = async (req, res) => {
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
};

// Controller function to get reviews for a specific car
const getCarReviews = async (req, res) => {
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
};

// Controller function to add a review for a specific car
const addCarReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
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
};

// Controller function to check if a user's location is eligible for car delivery based on the car's delivery configuration
const checkDelivery = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const { deliveryConfig } = car;
    if (!deliveryConfig) {
      return res.json({ eligible: false, message: 'Delivery information not available for this car.' });
    }
    const userPoint = turf.point([parseFloat(lng), parseFloat(lat)]);
    switch (deliveryConfig.type) {
      case 'anywhere':
        return res.json({ eligible: true, message: 'Delivery available anywhere' });
      case 'pickup':
        return res.json({ eligible: false, message: 'This car is pickup only' });
      case 'radius':
        if (!car.locationGeo || !deliveryConfig.radiusKm) {
          return res.json({ eligible: false, message: 'Delivery radius not configured correctly.' });
        }
        const carPoint = turf.point(car.locationGeo.coordinates);
        const distance = turf.distance(userPoint, carPoint, { units: 'kilometers' });
        if (distance <= deliveryConfig.radiusKm) {
          return res.json({ eligible: true, message: `Within ${deliveryConfig.radiusKm}km delivery radius` });
        }
        return res.json({ eligible: false, message: `Outside ${deliveryConfig.radiusKm}km delivery radius` });
      case 'polygon':
        if (!deliveryConfig.polygon || !deliveryConfig.polygon.coordinates) {
          return res.json({ eligible: false, message: 'Delivery zone not configured correctly.' });
        }
        const deliveryPolygon = turf.polygon(deliveryConfig.polygon.coordinates);
        const isInside = turf.booleanPointInPolygon(userPoint, deliveryPolygon);
        return res.json({
          eligible: isInside,
          message: isInside ? 'Inside custom delivery zone' : 'Outside custom delivery zone'
        });
      default:
        return res.json({ eligible: false, message: 'Unknown delivery type.' });
    }
  } catch (err) {
    console.error('Check delivery error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllCars,
  getCarById,
  getCarReviews,
  addCarReview,
  checkDelivery
};