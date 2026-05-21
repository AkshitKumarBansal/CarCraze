const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Car = require('../models/Car');
const upload = require('../storage/multer');
const cloudinary = require('cloudinary').v2;
const turf = require('@turf/turf');

const router = express.Router();

/**
 * Extract the Cloudinary public_id from a full Cloudinary URL so we can
 * destroy the asset. URLs are of the form:
 *   https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<public_id>.<ext>
 */
const extractPublicId = (url) => {
  try {
    const parts = url.split('/');
    // Everything after "upload/" minus the version segment
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Skip the version token (v12345)
    const relevantParts = parts.slice(uploadIndex + 2);
    const withExt = relevantParts.join('/');
    return withExt.replace(/\.[^/.]+$/, ''); // strip extension
  } catch {
    return null;
  }
};

const deleteCloudinaryImages = async (imageUrls) => {
  await Promise.all(
    imageUrls.map(async (url) => {
      try {
        const publicId = extractPublicId(url);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Failed to delete Cloudinary image:', url, err.message);
      }
    })
  );
};

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
      coordinates, availability, deliveryConfig, images: bodyImages
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
      coordinates,
      locationGeo: coordinates ? { type: 'Point', coordinates: [coordinates.lng, coordinates.lat] } : undefined,
      deliveryConfig,
      availability: listingType === 'rent' ? availability || null : null,
      images,
      status: 'active'
    });

    await carDoc.save();
    res.json({ message: 'Car added successfully', car: carDoc });
  } catch (err) {
    console.error('Add car error:', err);
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(f => f.path);
      await deleteCloudinaryImages(uploadedImages);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/seller/cars/:carId
// Bug #9 fix: whitelist allowed fields instead of spreading req.body directly
router.put('/cars/:carId', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    const { carId } = req.params;
    const car = await Car.findOne({ _id: carId, sellerId: req.user.userId });
    if (!car) return res.status(404).json({ message: 'Car not found or not owned by you' });

    // Whitelist the fields a seller is allowed to update
    const ALLOWED_FIELDS = [
      'brand', 'model', 'year', 'capacity', 'fuelType', 'transmission',
      'description', 'listingType', 'price', 'color', 'mileage', 'location',
      'coordinates', 'availability', 'deliveryConfig', 'status'
    ];

    // When using multipart/form-data, nested objects are often stringified.
    // We need to parse them back into objects before updating the document.
    const updateData = { ...req.body };
    const fieldsToParse = ['coordinates', 'availability', 'deliveryConfig'];
    fieldsToParse.forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          console.error(`Failed to parse JSON for field "${field}":`, updateData[field]);
          // Let Mongoose validation handle the incorrect type
        }
      }
    });

    ALLOWED_FIELDS.forEach(field => {
      if (updateData[field] !== undefined) {
        car[field] = updateData[field];
      }
    });

    if (updateData.coordinates) {
      car.locationGeo = {
        type: 'Point',
        coordinates: [updateData.coordinates.lng, updateData.coordinates.lat]
      };
    }

    // Handle new file uploads (Cloudinary URLs) — append to existing
    const newImages = req.files ? req.files.map(file => file.path) : [];
    if (newImages.length > 0) {
      car.images = [...(car.images || []), ...newImages];
    }

    // Sanitize deliveryConfig before saving to prevent validation errors
    // on fields that are not relevant to the selected delivery type.
    if (car.deliveryConfig) {
      if (car.deliveryConfig.type !== 'polygon') {
        car.deliveryConfig.polygon = undefined;
      }
      if (car.deliveryConfig.type !== 'radius') {
        car.deliveryConfig.radiusKm = undefined;
      }
      car.markModified('deliveryConfig');
    }

    if (car.listingType !== 'rent') car.availability = null;
    await car.save();
    res.json({ message: 'Car updated successfully', car });
  } catch (err) {
    console.error('Update car error:', err);
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(f => f.path);
      await deleteCloudinaryImages(uploadedImages);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/seller/cars/:carId
// Bug #8 fix: delete images from Cloudinary instead of local filesystem
router.delete('/cars/:carId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    const { carId } = req.params;
    const car = await Car.findOne({ _id: carId, sellerId: req.user.userId });
    if (!car) return res.status(404).json({ message: 'Car not found or not owned by you' });

    // Delete associated images from Cloudinary
    if (car.images && car.images.length > 0) {
      await deleteCloudinaryImages(car.images);
    }

    await car.deleteOne();
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Delete car error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/seller/cars/:carId/images
// Bug #8 fix: delete individual images from Cloudinary instead of filesystem
router.delete('/cars/:carId/images', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }

    const { carId } = req.params;
    const { images } = req.body; // Array of Cloudinary image URLs to delete

    const car = await Car.findOne({ _id: carId, sellerId: req.user.userId });
    if (!car) return res.status(404).json({ message: 'Car not found or not owned by you' });

    if (images && Array.isArray(images)) {
      // Only delete images that belong to this car
      const toDelete = images.filter(url => car.images.includes(url));
      await deleteCloudinaryImages(toDelete);

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

// NOTE: This endpoint is for a customer-facing feature but is placed here due to file context limitations.
// Ideally, this would be in a general `cars.js` router.
// The corresponding frontend component has been updated to call this new path.
router.post('/cars/:carId/check-delivery', async (req, res) => {
  try {
    const { carId } = req.params;
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const car = await Car.findById(carId).lean();
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    const { deliveryConfig, coordinates: carCoordinates } = car;

    if (!deliveryConfig) {
      return res.json({ eligible: false, message: 'Delivery information not available for this car.' });
    }

    const userPoint = turf.point([lng, lat]);

    switch (deliveryConfig.type) {
      case 'anywhere':
        return res.json({ eligible: true, message: 'This car can be delivered anywhere.' });

      case 'pickup':
        return res.json({ eligible: false, message: 'This car is available for pickup only.' });

      case 'radius':
        if (!carCoordinates || !deliveryConfig.radiusKm) {
          return res.json({ eligible: false, message: 'Delivery radius not configured correctly.' });
        }
        const carPoint = turf.point([carCoordinates.lng, carCoordinates.lat]);
        const distance = turf.distance(userPoint, carPoint, { units: 'kilometers' });

        if (distance <= deliveryConfig.radiusKm) {
          return res.json({ eligible: true, message: `You are within the ${deliveryConfig.radiusKm} km delivery radius.` });
        }
        return res.json({ eligible: false, message: `You are outside the ${deliveryConfig.radiusKm} km delivery radius.` });

      case 'polygon':
        if (!deliveryConfig.polygon || !deliveryConfig.polygon.coordinates) {
          return res.json({ eligible: false, message: 'Delivery zone not configured correctly.' });
        }
        const deliveryPolygon = turf.polygon(deliveryConfig.polygon.coordinates);
        const isInside = turf.booleanPointInPolygon(userPoint, deliveryPolygon);
        return res.json({ eligible: isInside, message: isInside ? 'You are inside the delivery zone.' : 'You are outside the delivery zone.' });

      default:
        return res.json({ eligible: false, message: 'Unknown delivery type.' });
    }
  } catch (err) {
    console.error('Check delivery error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;