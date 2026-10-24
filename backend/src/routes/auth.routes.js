
const express = require('express');

const {
  authLimiter,
  adminInvitationCreateLimiter,
  adminInvitationAcceptLimiter,
} = require('../middleware/rateLimiter');

const {
  validateSignup,
  validateLogin,
} = require('../middleware/validation');

const {
  authenticateToken,
  isAdmin,
} = require('../middleware/auth');

const {
  signup,
  signin,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');

const {
  createAdminInvitation,
  acceptAdminInvitation,
} = require('../controllers/auth/adminInvitation.controller');

const router = express.Router();

// Base route: /api/auth

// Public authentication routes
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/signin', authLimiter, validateLogin, signin);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Only authenticated administrators can create invitations.
// Only authenticated administrators can create invitations.
router.post(
  '/admin-invitations',
  authenticateToken,
  isAdmin,
  adminInvitationCreateLimiter,
  createAdminInvitation
);

// Invitees do not need an existing account.
router.post(
  '/admin-invitations/accept',
  adminInvitationAcceptLimiter,
  acceptAdminInvitation
);

module.exports = router;
