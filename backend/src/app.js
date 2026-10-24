
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const { errorHandler } = require('./middleware/error');

const healthRouter = require('./routes/health');
const uploadRouter = require('./routes/upload');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const sellerRouter = require('./routes/seller');
const carsRouter = require('./routes/cars');
const adminRoutes = require('./routes/admin.routes');
const rentalsRouter = require('./routes/rentals');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const contactRouter = require('./routes/contact');
const wishlistRouter = require('./routes/wishlist');

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Maximum 100 requests per IP per window
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    code: 'GLOBAL_RATE_LIMIT',
    message:
      'Too many requests from this IP. Please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json(options.message);
  },
});

const app = express();

// Trust one reverse proxy only if your deployment actually uses one.
// Configure this value to match your production proxy setup.
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Cookie parser must run before routes that read cookies
app.use(cookieParser());

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
);

// Apply global rate limiting before routes
app.use(globalLimiter);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/seller', sellerRouter);
app.use('/api/cars', carsRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/wishlist', wishlistRouter);

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app;