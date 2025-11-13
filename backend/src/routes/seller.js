const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Car = require('../models/Car');
const upload = require('../storage/multer');

const router = express.Router();

// GET /api/seller/cars
router.get('/cars', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    const myCars = await Car.find({ sellerId: req.user.userId }).lean();
    res.json({ cars: myCars });
  } catch (err) {
    console.error('Seller get cars error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/seller/cars
router.post('/cars', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }

    const {
      brand, model, year, capacity, fuelType, transmission,
      description, listingType, price, color, mileage, location,
      availability, images: bodyImages
    } = req.body;

  // Handle file uploads (Cloudinary URLs) - can come from req.files or req.body.images
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => file.path);
  } else if (bodyImages && Array.isArray(bodyImages)) {
    images = bodyImages;
  }

    const carDoc = new Car({
      sellerId: req.user.userId,
      brand, model, year, capacity, fuelType, transmission,
      description,
      listingType,
      price,
      color,
      mileage,
      location,
      availability: listingType === 'rent' ? availability || null : null,
      images,
      status: 'active'
    });

    await carDoc.save();
    res.json({ message: 'Car added successfully', car: carDoc });
  } catch (err) {
    console.error('Add car error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/seller/cars/:carId
router.put('/cars/:carId', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    const { carId } = req.params;
    const car = await Car.findOne({ _id: carId, sellerId: req.user.userId });
    if (!car) return res.status(404).json({ message: 'Car not found or not owned by you' });

  // Handle new file uploads (Cloudinary URLs)
  const newImages = req.files ? req.files.map(file => file.path) : [];
    
    // If new images are uploaded, append them to existing ones
    const updatedData = { ...req.body };
    if (newImages.length > 0) {
      updatedData.images = [...(car.images || []), ...newImages];
    }

    Object.assign(car, updatedData);
    if (car.listingType !== 'rent') car.availability = null;
    await car.save();
    res.json({ message: 'Car updated successfully', car });
  } catch (err) {
    console.error('Update car error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/seller/cars/:carId
router.delete('/cars/:carId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    const { carId } = req.params;
    const car = await Car.findOne({ _id: carId, sellerId: req.user.userId });
    if (!car) return res.status(404).json({ message: 'Car not found or not owned by you' });

    // Delete associated images from the filesystem
    if (car.images && car.images.length > 0) {
      const fs = require('fs');
      const path = require('path');
      car.images.forEach(imagePath => {
        try {
          const fullPath = path.join(__dirname, '../..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (error) {
          console.error(`Error deleting image ${imagePath}:`, error);
        }
      });
    }

    await car.deleteOne();
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Delete car error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/seller/cars/:carId/images
router.delete('/cars/:carId/images', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    
    const { carId } = req.params;
    const { images } = req.body; // Array of image paths to delete
    
    const car = await Car.findOne({ _id: carId, sellerId: req.user.userId });
    if (!car) return res.status(404).json({ message: 'Car not found or not owned by you' });

    if (images && Array.isArray(images)) {
      const fs = require('fs');
      const path = require('path');
      
      // Remove images from filesystem
      images.forEach(imagePath => {
        if (car.images.includes(imagePath)) {
          try {
            const fullPath = path.join(__dirname, '../..', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          } catch (error) {
            console.error(`Error deleting image ${imagePath}:`, error);
          }
        }
      });

      // Update car document
      car.images = car.images.filter(img => !images.includes(img));
      await car.save();
    }

    res.json({ message: 'Images deleted successfully', car });
  } catch (err) {
    console.error('Delete images error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;