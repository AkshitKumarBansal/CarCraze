const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const upload = require('../storage/multer');
const { PORT } = require('../config');

router.post(
  '/car-images',
  authenticateToken,
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Seller access required',
        });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No files uploaded',
          message: 'Please select at least one image to upload',
        });
      }
      const imageUrls = req.files.map((f) => `http://localhost:${PORT}/uploads/car-images/${f.filename}`);
      res.json({
        message: 'Images uploaded successfully',
        images: imageUrls,
      });
    } catch (err) {
      console.error('Image upload error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to upload images. Please try again.',
      });
    }
  }
);

module.exports = router;