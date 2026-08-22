const Cart = require('../models/Cart');
const Car = require('../models/Car');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmation } = require('../utils/emailService');

// Controller function to get the current user's cart
const getCart = async (req, res) => {
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
};

// Controller function to add an item to the cart
const addToCart = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user.userId; // Assuming auth middleware sets this

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    let finalPrice = car.price; // Default to base price for standard sales

    const isRentable = car.get('listingType') === 'rent' || car.get('category') === 'rental';

    // If it's a rental, the backend securely calculates the exact price
    if (isRentable) {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Rental dates are required' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInMs = end - start;
      const durationHours = Math.ceil(diffInMs / (1000 * 60 * 60));
      
      let durationUnits = durationHours;
      let baseRate = car.rentalPricing?.hourlyRate || (car.price / 24) || 10;

      if (durationHours >= 24) {
        durationUnits = Math.ceil(durationHours / 24);
        baseRate = car.rentalPricing?.dailyRate || car.price || 0;
      }

      const isWeekend = start.getDay() === 0 || start.getDay() === 6;
      const multiplier = isWeekend ? (car.rentalPricing?.weekendMultiplier || 1.0) : 1.0;
      
      finalPrice = baseRate * durationUnits * multiplier;
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if car is already in cart
    const existingItemIndex = cart.items.findIndex(item => item.car.toString() === carId);
    if (existingItemIndex > -1) {
      return res.status(400).json({ message: 'Car is already in your cart' });
    }

    // Add item with the securely calculated finalPrice
    cart.items.push({
      car: car._id,
      owner: car.sellerId,
      price: finalPrice, 
      startDate: isRentable ? new Date(startDate) : null,
      endDate: isRentable ? new Date(endDate) : null
    });

    await cart.save();
    res.status(200).json({ message: 'Added to cart successfully', cart });

  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to remove an item from the cart
const removeFromCart = async (req, res) => {
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
};

// Controller function to handle checkout, create an order, and send confirmation email
const checkoutCart = async (req, res) => {
  try {
    const { paymentMethod = 'online' } = req.body;
    const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.car');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    const total = cart.items.reduce((s, it) => s + (it.price || 0), 0);
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
    await Promise.all(
      cart.items.map(it => {
        const newStatus = it.car.listingType === 'rent' ? 'rented' : 'sold';
        return Car.findByIdAndUpdate(it.car._id, { status: newStatus });
      })
    );
    cart.items = [];
    await cart.save();
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
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart
};