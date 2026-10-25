
const Car = require('../models/Car');
const Review = require('../models/Review');
const turf = require('@turf/turf');

// Escape user input before using it in a regular expression.
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isProvided = (value) =>
  value !== undefined && value !== null && value !== '';

// Parse optional numeric filters safely.
const parseNumber = (value) => {
  if (!isProvided(value)) return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

const ALLOWED_SORT_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'price',
  'brand',
  'model',
  'year',
  'capacity'
]);

const MAX_PAGE_SIZE = 100;
const MAX_PAGE_NUMBER = 1000000;
const MAX_SEARCH_RADIUS_KM = 20000;

// Parse and validate numeric query parameters.
const parseQueryNumber = (value, name, options = {}) => {
  const { min = -Infinity, max = Infinity } = options;

  // Reject empty strings and non-scalar query values.
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    typeof value === 'object'
  ) {
    throw new Error(`${name} must be a valid number`);
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < min ||
    number > max
  ) {
    throw new Error(`${name} is outside the allowed range`);
  }

  return number;
};

// Build the filter for active cars.
// Separate $or groups are combined using $and so search and pickup
// conditions cannot overwrite each other.
const buildFilterQuery = (query) => {
  const filter = { status: 'active' };
  const andConditions = [];

  if (isProvided(query.listingType)) {
    if (typeof query.listingType !== 'string') {
      throw new Error('listingType must be a string');
    }

    filter.listingType = query.listingType;
  }

  if (isProvided(query.search)) {
    if (typeof query.search !== 'string') {
      throw new Error('search must be a string');
    }

    const search = query.search.trim();

    if (search.length > 100) {
      throw new Error('Search text must be 100 characters or fewer');
    }

    if (search) {
      const safeSearch = escapeRegex(search);

      andConditions.push({
        $or: [
          { brand: { $regex: safeSearch, $options: 'i' } },
          { model: { $regex: safeSearch, $options: 'i' } }
        ]
      });
    }
  }

  const priceMin = parseNumber(query.priceMin);
  const priceMax = parseNumber(query.priceMax);

  if (Number.isNaN(priceMin) || Number.isNaN(priceMax)) {
    throw new Error('Price filters must be valid finite numbers');
  }

  if (priceMin !== undefined && priceMin < 0) {
    throw new Error('priceMin cannot be negative');
  }

  if (priceMax !== undefined && priceMax < 0) {
    throw new Error('priceMax cannot be negative');
  }

  if (
    priceMin !== undefined &&
    priceMax !== undefined &&
    priceMin > priceMax
  ) {
    throw new Error('priceMin cannot exceed priceMax');
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    filter.price = {};

    if (priceMin !== undefined) {
      filter.price.$gte = priceMin;
    }

    if (priceMax !== undefined) {
      filter.price.$lte = priceMax;
    }
  }

  if (isProvided(query.fuelType)) {
    if (typeof query.fuelType !== 'string') {
      throw new Error('fuelType must be a string');
    }

    filter.fuelType = {
      $regex: `^${escapeRegex(query.fuelType)}$`,
      $options: 'i'
    };
  }

  if (isProvided(query.transmission)) {
    if (typeof query.transmission !== 'string') {
      throw new Error('transmission must be a string');
    }

    filter.transmission = {
      $regex: `^${escapeRegex(query.transmission)}$`,
      $options: 'i'
    };
  }

  if (isProvided(query.capacity)) {
    const capacity = parseNumber(query.capacity);

    if (!Number.isFinite(capacity) || capacity <= 0) {
      throw new Error('capacity must be a positive number');
    }

    filter.capacity = capacity;
  }

  if (query.pickupAvailable === 'true') {
    andConditions.push({
      $or: [
        { 'deliveryConfig.type': 'pickup' },
        { 'deliveryConfig.type': 'anywhere' },
        { 'deliveryConfig.pickupAvailable': { $ne: false } }
      ]
    });
  } else if (
    isProvided(query.pickupAvailable) &&
    query.pickupAvailable !== 'false'
  ) {
    throw new Error('pickupAvailable must be true or false');
  }

  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  return filter;
};

// Return a consistent pagination response.
const buildPagination = (total, currentPage, limit) => ({
  total,
  currentPage,
  totalPages: Math.ceil(total / limit)
});

// Get active cars with filtering, sorting, pagination and optional
// MongoDB geospatial search.
const getAllCars = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius,
      page = '1',
      limit = '12',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let pageNum;
    let limitNum;
    let latitude;
    let longitude;
    let searchRadius;

    // Validate numeric inputs and convert invalid values to HTTP 400.
    try {
      pageNum = parseQueryNumber(page, 'page', {
        min: 1,
        max: MAX_PAGE_NUMBER
      });

      limitNum = parseQueryNumber(limit, 'limit', {
        min: 1,
        max: MAX_PAGE_SIZE
      });

      if (!Number.isInteger(pageNum) || !Number.isInteger(limitNum)) {
        throw new Error('page and limit must be positive integers');
      }

      const hasLat = isProvided(lat);
      const hasLng = isProvided(lng);

      if (hasLat !== hasLng) {
        throw new Error('Both lat and lng are required for location search');
      }

      if (hasLat && hasLng) {
        latitude = parseQueryNumber(lat, 'lat', {
          min: -90,
          max: 90
        });

        longitude = parseQueryNumber(lng, 'lng', {
          min: -180,
          max: 180
        });
      }

      if (isProvided(radius)) {
        searchRadius = parseQueryNumber(radius, 'radius', {
          min: 0,
          max: MAX_SEARCH_RADIUS_KM
        });

        if (searchRadius === 0) {
          throw new Error('radius must be greater than zero');
        }

        if (!hasLat || !hasLng) {
          throw new Error('lat and lng are required when radius is provided');
        }
      }
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (
      typeof sortBy !== 'string' ||
      !ALLOWED_SORT_FIELDS.has(sortBy)
    ) {
      return res.status(400).json({
        message: 'Unsupported sortBy field'
      });
    }

    if (
      typeof sortOrder !== 'string' ||
      !['asc', 'desc'].includes(sortOrder)
    ) {
      return res.status(400).json({
        message: 'sortOrder must be asc or desc'
      });
    }

    const order = sortOrder === 'desc' ? -1 : 1;
    const skip = (pageNum - 1) * limitNum;

    let dbFilter;

    try {
      dbFilter = buildFilterQuery(req.query);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    // Stable sorting when multiple cars have the same sort value.
    const sortConfig = {
      [sortBy]: order,
      _id: 1
    };

    // LOCATION SEARCH:
    // Filter geographically in MongoDB instead of loading all cars
    // and calculating distances in application memory.
    if (isProvided(lat) && isProvided(lng)) {
      const geoNear = {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        key: 'locationGeo',
        distanceField: 'distanceMeters',
        spherical: true,
        query: dbFilter
      };

      if (searchRadius !== undefined) {
        geoNear.maxDistance = searchRadius * 1000;
      }

      const pipeline = [
        { $geoNear: geoNear },
        {
          $addFields: {
            distance: {
              $divide: ['$distanceMeters', 1000]
            }
          }
        },
        {
          $facet: {
            metadata: [
              { $count: 'total' }
            ],
            cars: [
              { $sort: sortConfig },
              { $skip: skip },
              { $limit: limitNum },
              {
                $project: {
                  distanceMeters: 0
                }
              }
            ]
          }
        }
      ];

      const results = await Car.aggregate(pipeline);
      const result = results[0] || {
        metadata: [],
        cars: []
      };

      const total = result.metadata[0]?.total || 0;

      return res.status(200).json({
        cars: result.cars,
        pagination: buildPagination(total, pageNum, limitNum)
      });
    }

    // STANDARD SEARCH:
    // Sorting, pagination and counting remain in MongoDB.
    const [cars, total] = await Promise.all([
      Car.find(dbFilter)
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Car.countDocuments(dbFilter)
    ]);

    return res.status(200).json({
      cars,
      pagination: buildPagination(total, pageNum, limitNum)
    });
  } catch (err) {
    console.error('Get cars error:', err);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get a single active car by ID.
const getCarById = async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      status: 'active'
    })
      .populate(
        'sellerId',
        'firstName lastName businessInfo rating'
      )
      .lean();

    if (!car) {
      return res.status(404).json({
        message: 'Car not found'
      });
    }

    return res.status(200).json({ car });
  } catch (err) {
    console.error('Get car by ID error:', err);

    if (err.name === 'CastError') {
      return res.status(404).json({
        message: 'Car not found'
      });
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get reviews for a specific car.
const getCarReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.id })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Add a review for a specific car.
const addCarReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (
      typeof rating !== 'number' ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message: 'Rating must be a number between 1 and 5'
      });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        message: 'Car not found'
      });
    }

    const existingReview = await Review.findOne({
      car: req.params.id,
      user: req.user.userId
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this car'
      });
    }

    const review = new Review({
      car: req.params.id,
      user: req.user.userId,
      rating,
      comment
    });

    await review.save();
    await review.populate('user', 'firstName lastName');

    return res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (err) {
    console.error('Add review error:', err);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Check whether a user's location is eligible for car delivery.
const checkDelivery = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    let latitude;
    let longitude;

    try {
      latitude = parseQueryNumber(lat, 'lat', {
        min: -90,
        max: 90
      });

      longitude = parseQueryNumber(lng, 'lng', {
        min: -180,
        max: 180
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        message: 'Car not found'
      });
    }

    const { deliveryConfig } = car;

    if (!deliveryConfig) {
      return res.status(200).json({
        eligible: false,
        message: 'Delivery information not available for this car.'
      });
    }

    const userPoint = turf.point([longitude, latitude]);

    switch (deliveryConfig.type) {
      case 'anywhere':
        return res.status(200).json({
          eligible: true,
          message: 'Delivery available anywhere'
        });

      case 'pickup':
        return res.status(200).json({
          eligible: false,
          message: 'This car is pickup only'
        });

      case 'radius': {
        if (
          !car.locationGeo ||
          car.locationGeo.type !== 'Point' ||
          !Array.isArray(car.locationGeo.coordinates) ||
          car.locationGeo.coordinates.length !== 2 ||
          !Number.isFinite(deliveryConfig.radiusKm) ||
          deliveryConfig.radiusKm <= 0
        ) {
          return res.status(200).json({
            eligible: false,
            message: 'Delivery radius not configured correctly.'
          });
        }

        const carPoint = turf.point(car.locationGeo.coordinates);
        const distance = turf.distance(userPoint, carPoint, {
          units: 'kilometers'
        });

        if (distance <= deliveryConfig.radiusKm) {
          return res.status(200).json({
            eligible: true,
            message: `Within ${deliveryConfig.radiusKm}km delivery radius`
          });
        }

        return res.status(200).json({
          eligible: false,
          message: `Outside ${deliveryConfig.radiusKm}km delivery radius`
        });
      }

      case 'polygon': {
        if (
          !deliveryConfig.polygon ||
          !Array.isArray(deliveryConfig.polygon.coordinates)
        ) {
          return res.status(200).json({
            eligible: false,
            message: 'Delivery zone not configured correctly.'
          });
        }

        const deliveryPolygon = turf.polygon(
          deliveryConfig.polygon.coordinates
        );

        const isInside = turf.booleanPointInPolygon(
          userPoint,
          deliveryPolygon
        );

        return res.status(200).json({
          eligible: isInside,
          message: isInside
            ? 'Inside custom delivery zone'
            : 'Outside custom delivery zone'
        });
      }

      default:
        return res.status(200).json({
          eligible: false,
          message: 'Unknown delivery type.'
        });
    }
  } catch (err) {
    console.error('Check delivery error:', err);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllCars,
  getCarById,
  getCarReviews,
  addCarReview,
  checkDelivery
};
