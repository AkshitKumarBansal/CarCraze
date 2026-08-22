const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', authenticateToken, getWishlist); // GET /api/wishlist — return the current user's wishlist (populated)
router.post('/:carId', authenticateToken, toggleWishlist); // POST /api/wishlist/:carId — toggle car in/out of wishlist

module.exports = router;