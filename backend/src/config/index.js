const path = require('path');

const PORT = process.env.PORT || 5000;

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
};