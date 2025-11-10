const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Car = require('../models/Car');

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
router.post('/cars', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }

    const {
      brand, model, year, capacity, fuelType, transmission,
      description, listingType, price, color, mileage, location,
      availability, images = [],
    } = req.body;

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
      images: Array.isArray(images) ? images : [],
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
router.put('/cars/:carId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    const { carId } = req.params;
    const car = await Car.findOne({ _id: carId, sellerId: req.user.userId });
    if (!car) return res.status(404).json({ message: 'Car not found or not owned by you' });

    Object.assign(car, req.body);
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

    await car.deleteOne();
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Delete car error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;