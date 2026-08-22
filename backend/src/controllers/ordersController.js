const Order = require('../models/Order');

// Controller function to get User's Orders 
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate('items.car')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Controller function to get User's Orders using User'Id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.car');
    if (!order) return res.status(404).json({ message: 'Order not found' });    
    if (order.userId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ order });
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

module.exports = {
  getUserOrders,
  getOrderById
};