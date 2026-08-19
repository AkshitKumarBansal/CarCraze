const path = require('path');
const mongoose = require('mongoose');

// 1. Centralized validation for all critical environment variables
const REQUIRED_ENV_VARS = ['JWT_SECRET', 'ADMIN_CODE', 'MONGO_URI'];

REQUIRED_ENV_VARS.forEach((envVar) => {
  if (!process.env[envVar]) {
    // Throwing an error allows the entry point to handle the failure gracefully
    // and generates a proper stack trace, rather than abruptly killing the process.
    throw new Error(`FATAL CONFIG ERROR: Environment variable ${envVar} is not set.`);
  }
});

const PORT = process.env.PORT || 5001;
const ROOT_DIR = path.join(__dirname, '..', '..');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');

// 2. Assign secrets without any hardcoded fallbacks
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_CODE = process.env.ADMIN_CODE;
const MONGO_URI = process.env.MONGO_URI;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:58899',
  'http://127.0.0.1:59600',
];

async function connectMongoDB() {
  mongoose.set('strictQuery', false);
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  console.log('MongoDB connected successfully!');

  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected!');
  });
}

module.exports = {
  PORT,
  ROOT_DIR,
  UPLOADS_DIR,
  JWT_SECRET,
  ADMIN_CODE,
  ALLOWED_ORIGINS,
  MONGO_URI,
  connectMongoDB,
};