const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Order = require('../models/Order');

// GET /api/orders - list orders for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate('items.car')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - get specific order (owned by user)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.car');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== req.user.userId.toString()) return res.status(403).json({ message: 'Forbidden' });
    res.json({ order });
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

module.exports = router;
