const express = require('express');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Car = require('../models/Car');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const { sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

// Middleware to ensure user is an admin for all routes in this file
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.use(authenticateToken, isAdmin);

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admin/users/:userId - Get a single user's comprehensive profile
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData = { ...user };

    // Populate role-specific data
    if (user.role === 'seller') {
      const inventory = await Car.find({ sellerId: user._id }).lean();
      const sales = await Order.find({ 'items.car.sellerId': user._id }).lean(); // Simplified sales history
      profileData.sellerData = {
        inventory,
        salesHistory: sales,
      };
    } else if (user.role === 'customer') {
      const orders = await Order.find({ customerId: user._id }).populate('items.car').lean();
      const rentals = await Rental.find({ customerId: user._id }).populate('carId').lean();
      profileData.customerData = {
        orderHistory: orders,
        rentalHistory: rentals,
      };
    }

    res.json({ user: profileData });
  } catch (err) {
    console.error('Admin get user profile error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/admin/users/:userId - General profile update
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ALLOWED_UPDATES = ['firstName', 'lastName', 'phone', 'businessInfo'];
    Object.keys(req.body).forEach(key => {
      if (ALLOWED_UPDATES.includes(key)) {
        if (key === 'businessInfo' && typeof req.body[key] === 'object') {
            user.businessInfo = { ...user.businessInfo, ...req.body[key] };
        } else {
            user[key] = req.body[key];
        }
      }
    });

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/admin/users/:userId/status - Activate/Deactivate/Ban
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { isActive, isBanned } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (typeof isBanned === 'boolean') user.isBanned = isBanned;

    await user.save();
    res.json({ message: 'User status updated successfully', isActive: user.isActive, isBanned: user.isBanned });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/admin/users/:userId/role - Change Role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: 'User role updated successfully', role: user.role });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/admin/users/:userId/verify - Verify Seller
router.put('/users/:userId/verify', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unverified', 'pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.verification.status = status;
    if (status === 'approved') user.verification.isVerified = true;
    else user.verification.isVerified = false;

    await user.save();
    res.json({ message: 'Verification status updated', verification: user.verification });
  } catch (err) {
    console.error('Update verification error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/admin/users/:userId/force-reset - Force Password Reset
router.post('/users/:userId/force-reset', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    res.json({ message: 'Password reset email sent to user' });
  } catch (err) {
    console.error('Force reset error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admin/users/:userId/login-history - Login History
router.get('/users/:userId/login-history', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('loginHistory').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ loginHistory: user.loginHistory || [] });
  } catch (err) {
    console.error('Get login history error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;