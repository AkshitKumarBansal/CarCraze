const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { JWT_SECRET } = require('../config');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    console.log('Received signup request:', req.body);

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      businessInfo,
      adminCode,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !phone || !role) {
      console.error('Missing required fields:', { email, firstName, lastName, phone, role });
      return res.status(400).json({
        message: 'Missing required fields',
        errors: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          firstName: !firstName ? 'First name is required' : null,
          lastName: !lastName ? 'Last name is required' : null,
          phone: !phone ? 'Phone is required' : null,
          role: !role ? 'Role is required' : null
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Validate admin code if registering as admin
    if (role === 'admin' && adminCode !== 'CARCRAZE_ADMIN_2024') {
      console.log('Invalid admin code attempt:', adminCode);
      return res.status(403).json({ message: 'Invalid admin code' });
    }

    // Create user based on role
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save hook
      phone,
      role: role || 'customer'
    };

    // Add business info for sellers
    if (role === 'seller' && businessInfo) {
      console.log('Adding business info for seller:', businessInfo);
      userData.businessInfo = businessInfo;
    }

    console.log('Creating new user:', { ...userData, password: '[REDACTED]' });
    const user = new User(userData);
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('User created successfully:', user._id);
    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    // Send more detailed error information
    res.status(500).json({
      message: 'Registration failed',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signin successful',
      token,
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      ...(user.role === 'seller' && {
        businessInfo: user.businessInfo,
        rating: user.rating
      })
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, businessInfo } = req.body;

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        message: 'First name, last name, and phone are required'
      });
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;

    // Update business info for sellers
    if (user.role === 'seller' && businessInfo) {
      user.businessInfo = businessInfo;
    }

    await user.save();

    // Return updated user data (excluding password)
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        ...(user.role === 'seller' && {
          businessInfo: user.businessInfo,
          rating: user.rating
        })
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message || 'Failed to update profile' });
  }
});

module.exports = router;