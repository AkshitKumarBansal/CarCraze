const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 1. Secure routing for Identity Documents
    if (file.fieldname === 'idDocument' || file.fieldname === 'drivingLicense') {
      return {
        folder: 'carcraze/verification',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        type: 'private' // Critical: Restricts public CDN access
      };
    }
    
    // 2. Default routing for Car Images
    return {
      folder: 'carcraze/cars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      transformation: [{ width: 1200, height: 800, crop: 'limit' }],
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5,
  },
});

module.exports = upload;