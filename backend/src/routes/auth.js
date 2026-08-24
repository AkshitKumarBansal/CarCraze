// const express = require('express');
// const { authenticateToken } = require('../middleware/auth');
// const { validateSignup, validateLogin, validateProfileUpdate } = require('../middleware/validation');
// const { authLimiter } = require('../middleware/rateLimiter');
// const upload = require('../middleware/multer');
// const { uploadVerificationDocuments } = require('../controllers/authController');
// const { 
//     signup, 
//     signin, 
//     getProfile, 
//     updateProfile, 
//     logout, 
//     forgotPassword, 
//     resetPassword 
// } = require('../controllers/authController');

// const router = express.Router();

// router.post('/signup', authLimiter, validateSignup, signup); // POST /api/auth/signup
// router.post('/signin', authLimiter, validateLogin, signin); // POST /api/auth/signin
// router.get('/profile', authenticateToken, getProfile); // GET /api/auth/profile
// router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile); // PUT /api/auth/profile
// router.post('/logout', logout); // POST /api/auth/logout
// router.post('/forgot-password', authLimiter, forgotPassword); // POST /api/auth/forgot-password
// router.post('/reset-password', resetPassword); // POST /api/auth/reset-password
// router.post('/verify-identity', authenticateToken, upload.fields([
//   { name: 'idDocument', maxCount: 1 },
//   { name: 'drivingLicense', maxCount: 1 }
// ]), uploadVerificationDocuments); // POST /api/auth/verify-identity

// module.exports = router;