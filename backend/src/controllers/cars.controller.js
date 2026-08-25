const Car = require('../models/Car');
const Review = require('../models/Review');
const turf = require('@turf/turf');

// Helper to build MongoDB query based on req.query parameters
const buildFilterQuery = (query) => {
  const filter = { status: 'active' };

  if (query.listingType) {
    filter.listingType = query.listingType;
  }
  
  if (query.search) {
    filter.$or = [
      { brand: { $regex: query.search, $options: 'i' } },
      { model: { $regex: query.search, $options: 'i' } }
    ];
  }

  if (query.priceMin || query.priceMax) {
    filter.price = {};
    // Ensure we are comparing numbers safely
    if (query.priceMin) filter.price.$gte = Number(query.priceMin);
    if (query.priceMax) filter.price.$lte = Number(query.priceMax);
  }

  // Use Case-Insensitive Regex for exact text matches
  if (query.fuelType) {
    filter.fuelType = { $regex: new RegExp(`^${query.fuelType}$`, 'i') };
  }
  
  if (query.transmission) {
    filter.transmission = { $regex: new RegExp(`^${query.transmission}$`, 'i') };
  }
  
  if (query.capacity) {
    // Check for both Number and String in case the DB schema is mixed
    filter.capacity = { $in: [Number(query.capacity), String(query.capacity)] };
  }

  // If pickup is requested, check the delivery config
  if (query.pickupAvailable === 'true') {
    filter.$or = [
      { 'deliveryConfig.type': 'pickup' },
      { 'deliveryConfig.type': 'anywhere' },
      { 'deliveryConfig.pickupAvailable': { $ne: false } }
    ];
  }

  return filter;
};

// Controller function to get all active cars, optionally filtered by location, paginated, and sorted
const getAllCars = async (req, res) => {
  try {
    const { 
      lat, 
      lng, 
      radius, 
      page = 1, 
      limit = 12, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const order = sortOrder === 'desc' ? -1 : 1;
    
    // Generate the dynamic filter based on query params
    const dbFilter = buildFilterQuery(req.query);
    console.log("MongoDB Filter:", JSON.stringify(dbFilter, null, 2));
    // SCENARIO 1: Location-based sorting/filtering (Requires in-memory processing with turf.js)
    if (lat && lng) {
      let cars = await Car.find(dbFilter).lean();
      const userPoint = turf.point([parseFloat(lng), parseFloat(lat)]);
      const searchRadius = radius ? parseFloat(radius) : null;

      // 1. Calculate distance and optionally filter by radius
      cars = cars.reduce((acc, car) => {
        if (car.locationGeo && car.locationGeo.coordinates && car.locationGeo.coordinates.length === 2) {
          const carPoint = turf.point(car.locationGeo.coordinates);
          car.distance = turf.distance(userPoint, carPoint, { units: 'kilometers' });
          
          if (!searchRadius || car.distance <= searchRadius) {
            acc.push(car);
          }
        }
        return acc;
      }, []);

      // 2. In-memory Sorting
      cars.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });

      // 3. In-memory Pagination
      const total = cars.length;
      const paginatedCars = cars.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.json({ 
        cars: paginatedCars,
        pagination: {
          total,
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    }

    // SCENARIO 2: Standard Database-level pagination & sorting
    const sortConfig = { [sortBy]: order };
    
    // Fallback if someone tries to sort by distance without providing lat/lng
    if (sortBy === 'distance') sortConfig['createdAt'] = order; 

    const cars = await Car.find(dbFilter)
      .sort(sortConfig)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Car.countDocuments(dbFilter);

    res.json({ 
      cars,
      pagination: {
        total,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (err) {
    console.error('Get cars error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to get a single car by ID, including seller information
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('sellerId', 'firstName lastName email phone businessInfo rating')
      .lean();
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ car });
  } catch (err) {
    console.error('Get car by ID error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to get reviews for a specific car
const getCarReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.id })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to add a review for a specific car
const addCarReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const existingReview = await Review.findOne({ car: req.params.id, user: req.user.userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this car' });
    }
    const review = new Review({
      car: req.params.id,
      user: req.user.userId,
      rating,
      comment
    });
    await review.save();
    await review.populate('user', 'firstName lastName');
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to check if a user's location is eligible for car delivery based on the car's delivery configuration
const checkDelivery = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const { deliveryConfig } = car;
    if (!deliveryConfig) {
      return res.json({ eligible: false, message: 'Delivery information not available for this car.' });
    }
    const userPoint = turf.point([parseFloat(lng), parseFloat(lat)]);
    switch (deliveryConfig.type) {
      case 'anywhere':
        return res.json({ eligible: true, message: 'Delivery available anywhere' });
      case 'pickup':
        return res.json({ eligible: false, message: 'This car is pickup only' });
      case 'radius':
        if (!car.locationGeo || !deliveryConfig.radiusKm) {
          return res.json({ eligible: false, message: 'Delivery radius not configured correctly.' });
        }
        const carPoint = turf.point(car.locationGeo.coordinates);
        const distance = turf.distance(userPoint, carPoint, { units: 'kilometers' });
        if (distance <= deliveryConfig.radiusKm) {
          return res.json({ eligible: true, message: `Within ${deliveryConfig.radiusKm}km delivery radius` });
        }
        return res.json({ eligible: false, message: `Outside ${deliveryConfig.radiusKm}km delivery radius` });
      case 'polygon':
        if (!deliveryConfig.polygon || !deliveryConfig.polygon.coordinates) {
          return res.json({ eligible: false, message: 'Delivery zone not configured correctly.' });
        }
        const deliveryPolygon = turf.polygon(deliveryConfig.polygon.coordinates);
        const isInside = turf.booleanPointInPolygon(userPoint, deliveryPolygon);
        return res.json({
          eligible: isInside,
          message: isInside ? 'Inside custom delivery zone' : 'Outside custom delivery zone'
        });
      default:
        return res.json({ eligible: false, message: 'Unknown delivery type.' });
    }
  } catch (err) {
    console.error('Check delivery error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllCars,
  getCarById,
  getCarReviews,
  addCarReview,
  checkDelivery
};