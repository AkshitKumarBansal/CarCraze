
const mongoose = require('mongoose');

jest.mock('../models/Car', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn()
}));

jest.mock('../models/Review', () => ({
  find: jest.fn(),
  findOne: jest.fn()
}));

const Car = require('../models/Car');
const {
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
      params: {
        id: carId
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('returns an active car successfully', async () => {
    const car = makeCar();

    Car.findOne.mockReturnValue(
      createMockQuery(car)
    );

    await getCarById(req, res);

    expect(Car.findOne).toHaveBeenCalledWith({
      _id: carId,
      status: 'active'
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ car });
  });

  test('does not return an inactive car', async () => {
    Car.findOne.mockReturnValue(
      createMockQuery(null)
    );

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
    Car.findOne.mockReturnValue(
      createMockQuery(null)
    );

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

    // Simulate the seller fields returned by the mocked query.
    // In a real Mongoose query, populate() applies the projection.
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
