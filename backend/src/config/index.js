
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

const ROOT_DIR = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'Data');

const CUSTOMER_FILE = path.join(DATA_DIR, 'customer.json');
const SELLER_FILE = path.join(DATA_DIR, 'seller.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const CARS_FILE = path.join(DATA_DIR, 'cars.json');

const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const CAR_IMAGES_DIR = path.join(UPLOADS_DIR, 'car-images');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_change_me';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:58899',
  'http://127.0.0.1:59600',
];

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carcraze';

async function connectMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGODB_URI, options);
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

  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    // Exit process with failure if we can't connect to MongoDB
    process.exit(1);
  }
}

module.exports = {
  PORT,
  ROOT_DIR,
  DATA_DIR,
  CUSTOMER_FILE,
  SELLER_FILE,
  ADMIN_FILE,
  CARS_FILE,
  UPLOADS_DIR,
  CAR_IMAGES_DIR,
  JWT_SECRET,
  ALLOWED_ORIGINS,
  MONGODB_URI,
  connectMongoDB,
};