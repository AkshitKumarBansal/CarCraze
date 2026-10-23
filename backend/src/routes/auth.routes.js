const express = require('express');
const { authLimiter, adminInvitationLimiter } = require('../middleware/rateLimiter');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Import from the new auth controllers folder
const { 
    signup, 
    signin, 
    logout, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/auth');

const {
  createAdminInvitation,
  acceptAdminInvitation
} = require('../controllers/auth/adminInvitation.controller');

const router = express.Router();

// Base route: /api/auth
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/signin', authLimiter, validateLogin, signin);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/admin-invitations', adminInvitationLimiter, authenticateToken, isAdmin, createAdminInvitation);
router.post('/admin-invitations/accept', adminInvitationLimiter, acceptAdminInvitation);

module.exports = router;