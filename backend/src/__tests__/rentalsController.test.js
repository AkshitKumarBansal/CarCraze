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
  findById: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn()
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

// Mock a Mongoose query that supports .session() and await.
const createMockQuery = (result) => ({
  session: jest.fn().mockReturnThis(),

  then: (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject),

  catch: (reject) =>
    Promise.resolve(result).catch(reject)
});

describe('Rental controller validation', () => {
  let req;
  let res;
  let mockSession;

  const carId = new mongoose.Types.ObjectId().toString();
  const userId = new mongoose.Types.ObjectId().toString();

  const makeCar = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(carId),
    status: 'active',
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
    ...overrides
  });

  const makeUser = (overrides = {}) => ({
    _id: new mongoose.Types.ObjectId(userId),
    role: 'customer',
    identityVerification: {
      status: 'verified'
    },
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockSession = {
      withTransaction: jest.fn(async (callback) => {
        await callback();
      }),
      endSession: jest.fn().mockResolvedValue(undefined)
    };

    jest.spyOn(mongoose, 'startSession')
      .mockResolvedValue(mockSession);

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

    Car.findOne.mockReturnValue(
      createMockQuery(makeCar())
    );

    Car.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1
    });

    Rental.findOne.mockReturnValue(
      createMockQuery(null)
    );

    User.findById.mockResolvedValue(makeUser());
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    test('rejects an inactive car', async () => {
      Car.findOne.mockReturnValue(
        createMockQuery(null)
      );

      await calculatePriceAndAvailability(req, res);

      expect(Car.findOne).toHaveBeenCalledWith({
        _id: carId,
        status: 'active'
      });

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Car not found'
      });
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
      Car.findOne.mockReturnValue(
        createMockQuery(
          makeCar({
            blackoutDates: [{
              startDate: new Date('2027-01-04T12:00:00.000Z'),
              endDate: new Date('2027-01-04T15:00:00.000Z')
            }]
          })
        )
      );

      await calculatePriceAndAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(409);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ available: false })
      );
    });

    test('rejects dates overlapping an existing booking', async () => {
      Rental.findOne.mockReturnValue(
        createMockQuery({ _id: 'existing-rental' })
      );

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

      expect(mongoose.startSession).toHaveBeenCalledTimes(1);
      expect(mockSession.withTransaction).toHaveBeenCalledTimes(1);
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);

      expect(Car.updateOne).toHaveBeenCalledWith(
        {
          _id: req.body.carId,
          status: 'active'
        },
        { $inc: { bookingLockVersion: 1 } },
        { session: mockSession }
      );

      expect(sendRentalReminder).toHaveBeenCalled();
    });

    test('rejects a booking overlapping a blackout period', async () => {
      Car.findOne.mockReturnValue(
        createMockQuery(
          makeCar({
            blackoutDates: [{
              startDate: new Date('2027-01-04T12:00:00.000Z'),
              endDate: new Date('2027-01-04T15:00:00.000Z')
            }]
          })
        )
      );

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(Rental).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      expect(sendRentalReminder).not.toHaveBeenCalled();
    });

    test('rejects a booking shorter than the minimum duration', async () => {
      req.body.endDate = '2027-01-04T11:00:00.000Z';

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Rental).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      expect(sendRentalReminder).not.toHaveBeenCalled();
    });

    test('rejects a booking when dates are already booked', async () => {
      Rental.findOne.mockReturnValue(
        createMockQuery({ _id: 'existing-rental' })
      );

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(Rental).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      expect(sendRentalReminder).not.toHaveBeenCalled();
    });

    test.each([
      'pending',
      'unverified',
      'rejected'
    ])(
      'rejects a customer whose identity status is %s',
      async (status) => {
        User.findById.mockResolvedValue(
          makeUser({
            identityVerification: { status }
          })
        );

        await createRental(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/not verified/i)
          })
        );

        expect(Rental).not.toHaveBeenCalled();
        expect(mongoose.startSession).not.toHaveBeenCalled();
        expect(sendRentalReminder).not.toHaveBeenCalled();
      }
    );

    test('allows a verified customer to proceed with rental creation', async () => {
      User.findById.mockResolvedValue(
        makeUser({
          identityVerification: { status: 'verified' }
        })
      );

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(Rental).toHaveBeenCalledTimes(1);
      expect(mongoose.startSession).toHaveBeenCalledTimes(1);
      expect(sendRentalReminder).toHaveBeenCalled();
    });

    test('rejects a customer whose identity verification is missing', async () => {
      User.findById.mockResolvedValue(
        makeUser({
          identityVerification: undefined
        })
      );

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Rental).not.toHaveBeenCalled();
      expect(mongoose.startSession).not.toHaveBeenCalled();
      expect(sendRentalReminder).not.toHaveBeenCalled();
    });

    test('rejects a customer whose identity verification is null', async () => {
      User.findById.mockResolvedValue(
        makeUser({
          identityVerification: null
        })
      );

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Rental).not.toHaveBeenCalled();
      expect(mongoose.startSession).not.toHaveBeenCalled();
      expect(sendRentalReminder).not.toHaveBeenCalled();
    });

    test('rejects a user who is not a customer', async () => {
      req.user.role = 'admin';

      await createRental(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(mongoose.startSession).not.toHaveBeenCalled();
      expect(Rental).not.toHaveBeenCalled();
    });
  });
});
