const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserOrders, getOrderById } = require('../controllers/ordersController');

router.get('/', authenticateToken, getUserOrders); // GET /api/orders - list orders for authenticated user
router.get('/:id', authenticateToken, getOrderById); // GET /api/orders/:id - get specific order (owned by user)

module.exports = router;