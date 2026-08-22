const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { 
  getAllCars, 
  getCarById, 
  getCarReviews, 
  addCarReview, 
  checkDelivery 
} = require('../controllers/carsController');

const router = express.Router();

router.get('/', getAllCars); // GET /api/cars — get all active cars, optionally filtered by location and radius
router.get('/:id', getCarById); // GET /api/cars/:id — get a single car by ID, including seller information
router.get('/:id/reviews', getCarReviews); // GET /api/cars/:id/reviews — get reviews for a car
router.post('/:id/reviews', authenticateToken, addCarReview); // POST /api/cars/:id/reviews — add a review for a car (requires authentication)
router.post('/:id/check-delivery', checkDelivery); // POST /api/cars/:id/check-delivery — verify if user is inside delivery zone

module.exports = router;