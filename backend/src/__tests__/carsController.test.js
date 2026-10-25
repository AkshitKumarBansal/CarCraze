
const mongoose = require('mongoose');

jest.mock('../models/Car', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../models/Review', () => ({
  find: jest.fn(),
  findOne: jest.fn()
}));

const Car = require('../models/Car');

const {
  getAllCars,
  getCarById
} = require('../controllers/cars.controller');

const createMockQuery = (result) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result)
});

describe('Cars controller - getCarById', () => {
  let req;
  let res;

  const carId = new mongoose.Types.ObjectId().toString();

  const makeCar = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(carId),
    brand: 'Toyota',
    model: 'Fortuner',
    status: 'active',
    sellerId: {
      _id: new mongoose.Types.ObjectId(),
      firstName: 'Test',
      lastName: 'Seller'
    },
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { id: carId }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('returns an active car successfully', async () => {
    const car = makeCar();

    Car.findOne.mockReturnValue(createMockQuery(car));

    await getCarById(req, res);

    expect(Car.findOne).toHaveBeenCalledWith({
      _id: carId,
      status: 'active'
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ car });
  });

  test('does not return an inactive car', async () => {
    Car.findOne.mockReturnValue(createMockQuery(null));

    await getCarById(req, res);

    expect(Car.findOne).toHaveBeenCalledWith({
      _id: carId,
      status: 'active'
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Car not found'
    });
  });

  test('returns 404 when the car does not exist', async () => {
    Car.findOne.mockReturnValue(createMockQuery(null));

    await getCarById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Car not found'
    });
  });

  test('does not expose seller email or phone', async () => {
    const car = makeCar();
    const query = createMockQuery(car);

    Car.findOne.mockReturnValue(query);

    await getCarById(req, res);

    expect(query.populate).toHaveBeenCalledWith(
      'sellerId',
      'firstName lastName businessInfo rating'
    );

    const response = res.json.mock.calls[0][0];

    expect(response.car.sellerId).not.toHaveProperty('email');
    expect(response.car.sellerId).not.toHaveProperty('phone');
  });

  test('returns 404 for an invalid car ID', async () => {
    req.params.id = 'invalid-id';

    Car.findOne.mockImplementation(() => {
      throw new mongoose.Error.CastError(
        'ObjectId',
        'invalid-id',
        '_id'
      );
    });

    await getCarById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Car not found'
    });
  });

  test('returns 500 for unexpected database errors', async () => {
    Car.findOne.mockImplementation(() => {
      throw new Error('Database failure');
    });

    await getCarById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error'
    });
  });
});

describe('Cars controller - getAllCars (Bug 10)', () => {
  let req;
  let res;

  const createFindQuery = (cars = []) => {
    const query = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(cars)
    };

    Car.find.mockReturnValue(query);

    return query;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    req = { query: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    Car.countDocuments.mockResolvedValue(0);

    Car.aggregate.mockResolvedValue([
      {
        metadata: [{ total: 0 }],
        cars: []
      }
    ]);
  });

  test('uses database sorting and pagination for normal searches', async () => {
    const cars = [
      { _id: 'car1', brand: 'Toyota', model: 'Fortuner' }
    ];

    const query = createFindQuery(cars);
    Car.countDocuments.mockResolvedValue(1);

    req.query = {
      page: '1',
      limit: '12',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    await getAllCars(req, res);

    expect(Car.find).toHaveBeenCalledWith({
      status: 'active'
    });

    expect(query.sort).toHaveBeenCalledWith({
      createdAt: -1,
      _id: 1
    });

    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.limit).toHaveBeenCalledWith(12);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      cars,
      pagination: {
        total: 1,
        currentPage: 1,
        totalPages: 1
      }
    });
  });

  test('calculates pagination correctly for later pages', async () => {
    const query = createFindQuery([{ _id: 'car3' }]);
    Car.countDocuments.mockResolvedValue(25);

    req.query = {
      page: '3',
      limit: '10'
    };

    await getAllCars(req, res);

    expect(query.skip).toHaveBeenCalledWith(20);
    expect(query.limit).toHaveBeenCalledWith(10);

    expect(res.json).toHaveBeenCalledWith({
      cars: [{ _id: 'car3' }],
      pagination: {
        total: 25,
        currentPage: 3,
        totalPages: 3
      }
    });
  });

  test.each([
    ['page zero', { page: '0' }],
    ['negative page', { page: '-1' }],
    ['fractional page', { page: '1.5' }],
    ['non-numeric page', { page: 'abc' }],
    ['page above maximum', { page: '1000001' }],
    ['limit zero', { limit: '0' }],
    ['limit above maximum', { limit: '101' }],
    ['fractional limit', { limit: '2.5' }],
    ['non-numeric limit', { limit: 'abc' }],
    ['latitude out of range', { lat: '91', lng: '75' }],
    ['longitude out of range', { lat: '30', lng: '181' }],
    ['missing longitude', { lat: '30' }],
    ['missing latitude', { lng: '75' }],
    ['negative radius', { lat: '30', lng: '75', radius: '-5' }],
    ['zero radius', { lat: '30', lng: '75', radius: '0' }],
    ['radius without coordinates', { radius: '10' }],
    ['unsupported sort field', { sortBy: 'password' }],
    ['invalid sort order', { sortOrder: 'sideways' }],
    ['infinite minimum price', { priceMin: 'Infinity' }],
    ['negative minimum price', { priceMin: '-1' }],
    [
      'reversed price range',
      { priceMin: '5000', priceMax: '1000' }
    ],
    ['invalid capacity', { capacity: 'abc' }],
    ['invalid pickup flag', { pickupAvailable: 'yes' }]
  ])('returns HTTP 400 for %s', async (_name, query) => {
    req.query = query;

    await getAllCars(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String)
      })
    );

    expect(Car.find).not.toHaveBeenCalled();
    expect(Car.aggregate).not.toHaveBeenCalled();
  });

  test('escapes regex metacharacters in search text', async () => {
    createFindQuery([]);

    req.query = { search: '.*' };

    await getAllCars(req, res);

    expect(Car.find).toHaveBeenCalledWith({
      status: 'active',
      $and: [
        {
          $or: [
            {
              brand: {
                $regex: '\\.\\*',
                $options: 'i'
              }
            },
            {
              model: {
                $regex: '\\.\\*',
                $options: 'i'
              }
            }
          ]
        }
      ]
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('rejects search text longer than 100 characters', async () => {
    req.query = {
      search: 'a'.repeat(101)
    };

    await getAllCars(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Car.find).not.toHaveBeenCalled();
  });

  test('combines search and pickup filters using separate $or groups', async () => {
    createFindQuery([]);

    req.query = {
      search: 'Toyota',
      pickupAvailable: 'true'
    };

    await getAllCars(req, res);

    const filter = Car.find.mock.calls[0][0];

    expect(filter.$and).toHaveLength(2);

    expect(filter.$and[0].$or).toEqual([
      {
        brand: {
          $regex: 'Toyota',
          $options: 'i'
        }
      },
      {
        model: {
          $regex: 'Toyota',
          $options: 'i'
        }
      }
    ]);

    expect(filter.$and[1].$or).toEqual([
      { 'deliveryConfig.type': 'pickup' },
      { 'deliveryConfig.type': 'anywhere' },
      { 'deliveryConfig.pickupAvailable': { $ne: false } }
    ]);
  });

  test('uses MongoDB geospatial aggregation for location searches', async () => {
    const cars = [
      {
        _id: 'car1',
        brand: 'Maruti Suzuki',
        distance: 2.5
      }
    ];

    Car.aggregate.mockResolvedValue([
      {
        metadata: [{ total: 1 }],
        cars
      }
    ]);

    req.query = {
      lat: '28.459',
      lng: '77.023',
      radius: '10',
      page: '1',
      limit: '12'
    };

    await getAllCars(req, res);

    expect(Car.find).not.toHaveBeenCalled();
    expect(Car.aggregate).toHaveBeenCalledTimes(1);

    const pipeline = Car.aggregate.mock.calls[0][0];
    const geoNear = pipeline[0].$geoNear;

    expect(geoNear.near).toEqual({
      type: 'Point',
      coordinates: [77.023, 28.459]
    });

    expect(geoNear.key).toBe('locationGeo');
    expect(geoNear.spherical).toBe(true);
    expect(geoNear.maxDistance).toBe(10000);
    expect(geoNear.query).toEqual({
      status: 'active'
    });

    expect(pipeline[1].$addFields.distance).toEqual({
      $divide: ['$distanceMeters', 1000]
    });

    expect(pipeline[2].$facet.cars).toEqual([
      { $sort: { createdAt: -1, _id: 1 } },
      { $skip: 0 },
      { $limit: 12 },
      { $project: { distanceMeters: 0 } }
    ]);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      cars,
      pagination: {
        total: 1,
        currentPage: 1,
        totalPages: 1
      }
    });
  });

  test('applies search and pickup filters to location searches', async () => {
    req.query = {
      lat: '28.459',
      lng: '77.023',
      search: 'Toyota',
      pickupAvailable: 'true'
    };

    await getAllCars(req, res);

    const pipeline = Car.aggregate.mock.calls[0][0];
    const filter = pipeline[0].$geoNear.query;

    expect(filter.status).toBe('active');
    expect(filter.$and).toHaveLength(2);
  });

  test('handles empty geospatial results', async () => {
    Car.aggregate.mockResolvedValue([
      {
        metadata: [],
        cars: []
      }
    ]);

    req.query = {
      lat: '28.459',
      lng: '77.023'
    };

    await getAllCars(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      cars: [],
      pagination: {
        total: 0,
        currentPage: 1,
        totalPages: 0
      }
    });
  });

  test('returns HTTP 500 for unexpected database errors', async () => {
    createFindQuery([]);

    Car.countDocuments.mockRejectedValue(
      new Error('Database failure')
    );

    await getAllCars(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error'
    });
  });
});
