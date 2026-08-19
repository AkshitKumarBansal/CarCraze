const path = require('path');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5001;
const ROOT_DIR = path.join(__dirname, '..', '..');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');

if(!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET environment variable is not set. Using default secret. Please set it in your .env file for production.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:58899',
  'http://127.0.0.1:59600',
];

const MONGO_URI = process.env.MONGO_URI;

async function connectMongoDB() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set. Please set it in your .env file.');
  }

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
  ALLOWED_ORIGINS,
  MONGO_URI,
  connectMongoDB,
};