const express = require('express');
const cors = require('cors');
const path = require('path');
const { ALLOWED_ORIGINS } = require('./config');

const healthRouter = require('./routes/health');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');
const sellerRouter = require('./routes/seller');
const carsRouter = require('./routes/cars');
const adminRouter = require('./routes/admin');

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

// Routes
app.use('/api/health', healthRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/cars', carsRouter);
app.use('/api/admin', adminRouter);

module.exports = app;