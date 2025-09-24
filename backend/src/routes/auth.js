const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { authenticateToken } = require('../middleware/auth');
const { JWT_SECRET } = require('../config');
const {
  readAllUsers,
  readCustomers, writeCustomers,
  readSellers, writeSellers,
  readAdmins, writeAdmins,
} = require('../services/fileDb');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role, // 'customer' | 'seller' | 'admin'
      businessInfo,
      adminCode,
    } = req.body;

    const allUsers = await readAllUsers();
    const exists = allUsers.some((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Optional: validate admin code
    if (role === 'admin' && adminCode && adminCode !== 'CARCRAZE_ADMIN_2024') {
      return res.status(403).json({ message: 'Invalid admin code' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const baseUser = {
      id: `${role}_${Date.now()}`,
      firstName,
      lastName,
      email,
      password: hashed,
      phone,
      role,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
    };

    if (role === 'customer') {
      const customers = await readCustomers();
      customers.push(baseUser);
      await writeCustomers(customers);
    } else if (role === 'seller') {
      const sellers = await readSellers();
      sellers.push({
        ...baseUser,
        businessInfo: businessInfo || {},
        inventory: [],
        salesHistory: [],
        rating: { average: 0, totalReviews: 0 },
        verification: { isVerified: false, documents: [] },
      });
      await writeSellers(sellers);
    } else if (role === 'admin') {
      const admins = await readAdmins();
      admins.push(baseUser);
      await writeAdmins(admins);
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const allUsers = await readAllUsers();
    const user = allUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signin successful',
      token,
      user: { id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, email: user.email },
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const allUsers = await readAllUsers();
    const user = allUsers.find((u) => u.id === req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;