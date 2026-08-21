const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { 
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };