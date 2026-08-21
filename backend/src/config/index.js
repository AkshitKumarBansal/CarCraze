const mongoose = require('mongoose');

// 1. Centralized validation for all critical environment variables
const REQUIRED_ENV_VARS = [
  'JWT_SECRET', 
  'ADMIN_CODE', 
  'MONGO_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

REQUIRED_ENV_VARS.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`FATAL CONFIG ERROR: Environment variable ${envVar} is not set.`);
  }
});

// 2. Database Connection
async function connectMongoDB() {
  mongoose.set('strictQuery', false);
  
  // Use the environment variable directly
  await mongoose.connect(process.env.MONGO_URI, {
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

// Only export what is actually needed
module.exports = { connectMongoDB };