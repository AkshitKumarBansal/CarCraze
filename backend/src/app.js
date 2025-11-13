const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { ALLOWED_ORIGINS } = require('./config');
const { errorHandler } = require('./middleware/error');

const healthRouter = require('./routes/health');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');
const sellerRouter = require('./routes/seller');
const carsRouter = require('./routes/cars');
const adminRouter = require('./routes/admin');
const rentalsRouter = require('./routes/rentals');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const app = express();

// CORS
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static: uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Apply rate limiting to all routes
app.use(limiter);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/cars', carsRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

// 404 Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;