const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Car = require('../models/Car');
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../utils/emailService');
const User = require('../models/User');

// GET /api/cart - get current user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId })
      .populate('items.car')
      .populate('items.owner', 'firstName lastName email phone');
    if (!cart) {
      return res.json({ items: [], total: 0 });
    }
    const total = cart.items.reduce((s, it) => s + (it.price || 0), 0);
    res.json({ items: cart.items, total });
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// POST /api/cart - add an item to cart { carId }
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    if (!carId) return res.status(400).json({ message: 'carId is required' });

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    if (car.status !== 'active') return res.status(400).json({ message: 'Car is not available' });

    let calculatedPrice = car.price;
    let validStartDate = null;
    let validEndDate = null;

    // If it's a rental, calculate the total price based on the number of days
    if (car.listingType === 'rent') {
      if (!startDate || !endDate) return res.status(400).json({ message: 'Pickup and Return dates are required for rentals' });
      
      // Parse dates as UTC to avoid timezone issues
      validStartDate = new Date(startDate + 'T00:00:00.000Z');
      validEndDate = new Date(endDate + 'T00:00:00.000Z');
      if (validEndDate < validStartDate) return res.status(400).json({ message: 'Return date cannot be before pickup date' });

      const msPerDay = 1000 * 60 * 60 * 24;
      // Calculate inclusive number of days. +1 because a 1-day rental (e.g., 10th-10th) has a 0ms difference.
      const days = Math.round((validEndDate.getTime() - validStartDate.getTime()) / msPerDay) + 1;
      calculatedPrice = Number(car.price) * days;
    }

    // Re-fetch with a fresh query to reduce the race-condition window
    const freshCar = await Car.findById(carId);
    if (!freshCar || freshCar.status !== 'active') {
      return res.status(400).json({ message: 'Car is no longer available' });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [] });
    }

    const exists = cart.items.some(it => it.car.toString() === car._id.toString());
    if (exists) return res.status(409).json({ message: 'Car already in cart' });

    cart.items.push({ 
      car: car._id, 
      owner: car.sellerId, 
      price: calculatedPrice,
      startDate: validStartDate,
      endDate: validEndDate
    });
    await cart.save();

    res.status(201).json({ message: 'Added to cart', item: cart.items[cart.items.length - 1] });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// DELETE /api/cart/:carId - remove item
router.delete('/:carId', authenticateToken, async (req, res) => {
  try {
    const { carId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const before = cart.items.length;
    cart.items = cart.items.filter(it => it.car.toString() !== carId.toString());
    if (cart.items.length === before) return res.status(404).json({ message: 'Item not found in cart' });
    await cart.save();
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// POST /api/cart/checkout - checkout cart (simulate payment)
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const { paymentMethod = 'online' } = req.body;
    const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.car');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const total = cart.items.reduce((s, it) => s + (it.price || 0), 0);

    // Create order
    // set a simple estimated delivery date (7 days from now)
    const deliveryEstimate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const order = new Order({
      userId: req.user.userId,
      items: cart.items.map(it => ({
        car: it.car._id,
        owner: it.owner,
        price: it.price,
        startDate: it.startDate || null,
        endDate: it.endDate || null
      })),
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      status: paymentMethod === 'cod' ? 'created' : 'completed',
      deliveryDate: deliveryEstimate
    });

    await order.save();

    // Update car statuses: sale → 'sold', rental → 'rented'
    await Promise.all(
      cart.items.map(it => {
        const newStatus = it.car.listingType === 'rent' ? 'rented' : 'sold';
        return Car.findByIdAndUpdate(it.car._id, { status: newStatus });
      })
    );

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send order confirmation email asynchronously
    try {
      const populatedOrder = await Order.findById(order._id).populate('items.car');
      const user = await User.findById(req.user.userId);
      if (user && populatedOrder) {
        sendOrderConfirmation(user, populatedOrder).catch(err => console.error('Failed to send order email:', err));
      }
    } catch (emailErr) {
      console.error('Error preparing order email:', emailErr);
    }

    res.status(201).json({ message: 'Checkout successful', orderId: order._id, total });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Checkout failed' });
  }
});

module.exports = router;
