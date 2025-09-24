const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { readCars, writeCars } = require('../services/fileDb');

const router = express.Router();

// GET /api/seller/cars
router.get('/cars', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    const cars = await readCars();
    const myCars = cars.filter((c) => c.sellerId === req.user.userId);
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
    const cars = await readCars();

    const {
      brand, model, year, capacity, fuelType, transmission,
      description, listingType, price, color, mileage, location,
      availability, images = [],
    } = req.body;

    const car = {
      id: `car_${Date.now()}`,
      sellerId: req.user.userId,
      brand, model, year, capacity, fuelType, transmission,
      description,
      listingType, // 'sale_new' | 'sale_old' | 'rent'
      price,
      color,
      mileage,
      location,
      availability: listingType === 'rent' ? availability || null : null,
      images: Array.isArray(images) ? images : [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    cars.push(car);
    await writeCars(cars);

    res.json({ message: 'Car added successfully', car });
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
    const cars = await readCars();
    const idx = cars.findIndex((c) => c.id === carId && c.sellerId === req.user.userId);
    if (idx === -1) return res.status(404).json({ message: 'Car not found or not owned by you' });

    const updated = {
      ...cars[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    // For non-rent, ensure availability null
    if (updated.listingType !== 'rent') updated.availability = null;

    cars[idx] = updated;
    await writeCars(cars);
    res.json({ message: 'Car updated successfully', car: updated });
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
    const cars = await readCars();
    const car = cars.find((c) => c.id === carId && c.sellerId === req.user.userId);
    if (!car) return res.status(404).json({ message: 'Car not found or not owned by you' });

    const remaining = cars.filter((c) => !(c.id === carId && c.sellerId === req.user.userId));
    await writeCars(remaining);
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Delete car error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;