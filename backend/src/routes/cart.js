const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  getCart, 
  addToCart, 
  removeFromCart, 
  checkoutCart 
} = require('../controllers/cartController');

router.get('/', authenticateToken, getCart); // GET /api/cart - get current user's cart
router.post('/', authenticateToken, addToCart); // POST /api/cart - add an item to cart { carId, startDate, endDate } for rentals
router.delete('/:carId', authenticateToken, removeFromCart); // DELETE /api/cart/:carId - remove item from cart
router.post('/checkout', authenticateToken, checkoutCart); // POST /api/cart/checkout - checkout cart (simulate payment)

module.exports = router;