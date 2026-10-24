const mongoose = require('mongoose');

// Register mocks before importing the controller or models.
jest.mock('../models/Rental', () => {
  const MockRental = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });

  MockRental.findOne = jest.fn();
  MockRental.findById = jest.fn();

  return MockRental;
});

jest.mock('../models/Car', () => ({
  findById: jest.fn()
}));

jest.mock('../models/User', () => ({
  findById: jest.fn()
}));

jest.mock('../utils/emailService', () => ({
  sendRentalReminder: jest.fn().mockResolvedValue(undefined)
}));

const Rental = require('../models/Rental');
const Car = require('../models/Car');
const User = require('../models/User');
const { sendRentalReminder } = require('../utils/emailService');
const {
  calculatePriceAndAvailability,
  createRental
} = require('../controllers/rentalsController');


describe('Rental controller validation', () => {
  let req;
  let res;

  const carId = new mongoose.Types.ObjectId().toString();
  const userId = new mongoose.Types.ObjectId().toString();

  const makeCar = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(carId),
    listingType: 'rent',
    category: 'rental',
    price: 240,
    rentalPricing: {
      hourlyRate: 10,
      dailyRate: 240,
      weekendMultiplier: 1,
      minRentalHours: 2
    },
    blackoutDates: [],
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides
  });

  const makeUser = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(userId),
    role: 'customer',
    verification: { status: 'verified' },
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        carId,
        startDate: '2027-01-04T10:00:00.000Z',
        endDate: '2027-01-04T14:00:00.000Z'
      },
      user: {
        userId,
        role: 'customer'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    Car.findById.mockResolvedValue(makeCar());
    Rental.findOne.mockResolvedValue(null);
    User.findById.mockResolvedValue(makeUser());

  });

  describe('calculatePriceAndAvailability', () => {
    test('returns pricing for an available car', async () => {
      await calculatePriceAndAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          available: true,
          pricingBreakdown: expect.objectContaining({
            rentalTier: 'hourly',
            durationUnits: 4,
            baseRate: 10,
            totalCalculatedPrice: 40
          })
        })
      );
    });

    test('rejects invalid dates', async () => {
      req.body.startDate = 'not-a-date';

      await calculatePriceAndAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('rejects an end date before the start date', async () => {
      req.body.endDate = '2027-01-04T09:00:00.000Z';

      await calculatePriceAndAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('rejects a rental shorter than the minimum duration', async () => {
      req.body.endDate = '2027-01-04T11:00:00.000Z';

      await calculatePriceAndAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Minimum rental')
        })
      );
    });

    test('rejects dates overlapping a blackout period', async () => {
      Car.findById.mockResolvedValue(
        makeCar({
          blackoutDates: [{
            startDate: new Date('2027-01-04T12:00:00.000Z'),
            endDate: new Date('2027-01-04T15:00:00.000Z')
          }]
        })
      );

      await calculatePriceAndAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ available: false })
      );
    });

    test('rejects dates overlapping an existing booking', async () => {
      Rental.findOne.mockResolvedValue({ _id: 'existing-rental' });

      await calculatePriceAndAvailability(req, res);

      expect(Rental.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          status: { $in: ['booked', 'active'] }
        })
      );
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('createRental', () => {
    test('creates a rental using the calculated pricing', async () => {
      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(Rental).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: expect.any(mongoose.Types.ObjectId),
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
          durationHours: 4,
          rentalTier: 'hourly',
          totalAmount: 40
        })
      );
    });

    test('rejects a booking overlapping a blackout period', async () => {
      Car.findById.mockResolvedValue(
        makeCar({
          blackoutDates: [{
            startDate: new Date('2027-01-04T12:00:00.000Z'),
            endDate: new Date('2027-01-04T15:00:00.000Z')
          }]
        })
      );

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(Rental).not.toHaveBeenCalled();
    });

    test('rejects a booking shorter than the minimum duration', async () => {
      req.body.endDate = '2027-01-04T11:00:00.000Z';

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Rental).not.toHaveBeenCalled();
    });

    test('rejects a booking when dates are already booked', async () => {
      Rental.findOne.mockResolvedValue({ _id: 'existing-rental' });

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(Rental).not.toHaveBeenCalled();
    });

    test('rejects an unverified customer', async () => {
      User.findById.mockResolvedValue(
        makeUser({ verification: { status: 'pending' } })
      );

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Rental).not.toHaveBeenCalled();
    });
  });
});
