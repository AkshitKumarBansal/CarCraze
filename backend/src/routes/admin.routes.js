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
  getLoginHistory,
  getPendingVerifications,
  updateVerificationStatus
} = require('../controllers/admin'); // Points to the new admin controllers folder

const router = express.Router();

// Middleware to ensure user is an admin for all routes in this file
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Apply auth and admin checks to all routes below
router.use(authenticateToken, isAdmin);

// User Management Routes
router.get('/users', getAllUsers); 
router.get('/users/:userId', getUserProfile); 
router.put('/users/:userId', updateUser); 

// Access & Security Routes
router.put('/users/:userId/status', updateUserStatus); 
router.put('/users/:userId/role', updateUserRole); 
router.post('/users/:userId/force-reset', forcePasswordReset); 
router.get('/users/:userId/login-history', getLoginHistory); 

// Verification & KYC Routes
router.get('/verifications/pending', getPendingVerifications); 
router.put('/verifications/:userId', updateVerificationStatus); 
router.put('/users/:userId/verify', verifySeller); 

module.exports = router;