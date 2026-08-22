const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAllUsers,
  getUserProfile,
  updateUser,
  updateUserStatus,
  updateUserRole,
  verifySeller,
  forcePasswordReset,
  getLoginHistory
} = require('../controllers/adminController');

const router = express.Router();

// Middleware to ensure user is an admin for all routes in this file
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.use(authenticateToken, isAdmin);

router.get('/users', getAllUsers); // GET /api/admin/users - Get all users
router.get('/users/:userId', getUserProfile); // GET /api/admin/users/:userId - Get a single user's comprehensive profile
router.put('/users/:userId', updateUser); // PUT /api/admin/users/:userId - General profile update
router.put('/users/:userId/status', updateUserStatus); // PUT /api/admin/users/:userId/status - Activate/Deactivate/Ban
router.put('/users/:userId/role', updateUserRole); // PUT /api/admin/users/:userId/role - Change Role
router.put('/users/:userId/verify', verifySeller); // PUT /api/admin/users/:userId/verify - Verify Seller
router.post('/users/:userId/force-reset', forcePasswordReset); // POST /api/admin/users/:userId/force-reset - Force Password Reset
router.get('/users/:userId/login-history', getLoginHistory); // GET /api/admin/users/:userId/login-history - Login History

module.exports = router;