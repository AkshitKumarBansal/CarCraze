
const rateLimit = require('express-rate-limit');

// Login, signup, and password recovery attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'AUTH_RATE_LIMIT',
    message:
      'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Creating invitations: restrict repeated invitation generation.
const adminInvitationCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'ADMIN_INVITATION_CREATE_RATE_LIMIT',
    message:
      'Too many invitation creation attempts. Please try again later.',
  },
});

// Accepting invitations: allow a separate budget for invitees.
const adminInvitationAcceptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'ADMIN_INVITATION_ACCEPT_RATE_LIMIT',
    message:
      'Too many invitation acceptance attempts. Please try again later.',
  },
});

module.exports = {
  authLimiter,
  adminInvitationCreateLimiter,
  adminInvitationAcceptLimiter,
};