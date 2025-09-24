const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { readAllUsers } = require('../services/fileDb');

const router = express.Router();

// GET /api/admin/users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const users = await readAllUsers();
    res.json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;