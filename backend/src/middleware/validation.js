const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: true })
    .withMessage('Please enter a valid phone number including the country code (e.g., +91)'),
  body('businessInfo.phone')
    .optional() 
    .isMobilePhone('any', { strictMode: true })
    .withMessage('Please enter a valid business phone number including the country code'),
  body('role')
    .isIn(['customer', 'seller', 'admin'])
    .withMessage('Invalid role specified')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateProfileUpdate = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: true })
    .withMessage('Please enter a valid phone number including the country code (e.g., +91)'),
  body('businessInfo.phone')
    .optional()
    .isMobilePhone('any', { strictMode: true })
    .withMessage('Please enter a valid business phone number including the country code')
];

// ... (keep your existing validateSignup and validateLogin rules at the top)

// The checker function
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array().map(err => ({
        field: err.path || err.param, // Handles both v6 and v7 of express-validator
        message: err.msg
      }))
    });
  }
  next();
};

// Bundle the rules AND the checker function together!
module.exports = {
  validateSignup: [...validateSignup, validate],
  validateLogin: [...validateLogin, validate],
  validateProfileUpdate: [...validateProfileUpdate, validate]
};