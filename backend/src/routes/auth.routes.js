const express = require('express');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateSignup, validateLogin } = require('../middleware/validation');

// Import from the new auth controllers folder
const { 
    signup, 
    signin, 
    logout, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/auth');

const router = express.Router();

// Base route: /api/auth
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/signin', authLimiter, validateLogin, signin);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;