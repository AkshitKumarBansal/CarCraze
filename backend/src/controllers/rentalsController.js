
const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Car = require('../models/Car');
const User = require('../models/User');
const { sendRentalReminder } = require('../utils/emailService');

class RentalValidationError extends Error {
  constructor(statusCode, message, extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.extra = extra;
  }
}

// Shared validation, availability and pricing logic for both endpoints.
const getRentalDetails = async ({ carId, startDate, endDate, session }) => {
  if (!carId || !startDate || !endDate) {
    throw new RentalValidationError(
      400,
      'carId, startDate and endDate are required'
    );
  }

  if (!mongoose.Types.ObjectId.isValid(carId)) {
    throw new RentalValidationError(400, 'Invalid carId');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime())
  ) {
    throw new RentalValidationError(400, 'Invalid rental dates');
  }

  if (end <= start) {
    throw new RentalValidationError(
      400,
      'End date must be after start date'
    );
  }

  const carQuery = Car.findById(carId);

  if (session) {
    carQuery.session(session);
  }

  const car = await carQuery;

  if (!car) {
    throw new RentalValidationError(404, 'Car not found');
  }

  const isRentable =
    car.listingType === 'rent' || car.category === 'rental';

  if (!isRentable) {
    throw new RentalValidationError(
      400,
      'Car is not available for rent'
    );
  }

  // Reject a rental that overlaps any blackout period.
  const isBlackedOut = (car.blackoutDates || []).some((blackout) => {
    const blackoutStart = new Date(blackout.startDate);
    const blackoutEnd = new Date(blackout.endDate);

    return start < blackoutEnd && end > blackoutStart;
  });

  if (isBlackedOut) {
    throw new RentalValidationError(
      409,
      'Car is unavailable for these dates.',
      { available: false }
    );
  }

  // Only bookings that occupy the car should block availability.
  // Adjacent bookings are allowed: one can end when another begins.
  
  const rentalQuery = Rental.findOne({
    car: car._id,
    status: { $in: ['booked', 'active'] },
    startDate: { $lt: end },
    endDate: { $gt: start }
  });

  if (session) {
    rentalQuery.session(session);
  }

  const overlappingRental = await rentalQuery;


  if (overlappingRental) {
    throw new RentalValidationError(
      409,
      'Car is already booked for these dates.',
      { available: false }
    );
  }

  const durationHours = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  );

  const minHours = car.rentalPricing?.minRentalHours ?? 2;

  if (
    !Number.isFinite(minHours) ||
    minHours < 1 ||
    durationHours < minHours
  ) {
    throw new RentalValidationError(
      400,
      `Minimum rental is ${minHours} hours.`
    );
  }

  let rentalTier = 'hourly';
  let durationUnits = durationHours;
  let baseRate =
    car.rentalPricing?.hourlyRate ?? (car.price / 24) ?? 10;

  if (durationHours >= 24) {
    rentalTier = 'daily';
    durationUnits = Math.ceil(durationHours / 24);
    baseRate = car.rentalPricing?.dailyRate ?? car.price ?? 0;
  }

  const isWeekend = start.getDay() === 0 || start.getDay() === 6;
  const multiplier = isWeekend
    ? (car.rentalPricing?.weekendMultiplier ?? 1)
    : 1;

  if (
    !Number.isFinite(baseRate) ||
    baseRate < 0 ||
    !Number.isFinite(multiplier) ||
    multiplier < 1
  ) {
    throw new RentalValidationError(
      400,
      'Invalid rental pricing configuration'
    );
  }

  const subtotal = baseRate * durationUnits;
  const totalCalculatedPrice = subtotal * multiplier;

  const pricingBreakdown = {
    rentalTier,
    durationUnits,
    baseRate,
    surgeMultiplierApplied: multiplier,
    surgeFee: totalCalculatedPrice - subtotal,
    totalCalculatedPrice
  };

  return {
    car,
    start,
    end,
    durationHours,
    rentalTier,
    durationUnits,
    baseRate,
    totalCalculatedPrice,
    pricingBreakdown
  };
};

const calculatePriceAndAvailability = async (req, res) => {
  try {
    const details = await getRentalDetails(req.body);

    return res.status(200).json({
      available: true,
      pricingBreakdown: details.pricingBreakdown
    });
  } catch (err) {
    if (err instanceof RentalValidationError) {
      return res.status(err.statusCode).json({
        message: err.message,
        ...err.extra
      });
    }

    console.error('Calculate pricing error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const createRental = async (req, res) => {
  let session;

  try {
    if (req.user?.role !== 'customer') {
      return res.status(403).json({
        message: 'Customer access required'
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (user.verification?.status !== 'verified') {
      return res.status(403).json({
        message:
          'Account not verified. Please verify your identity in your profile to book rentals.'
      });
    }

    session = await mongoose.startSession();

    let rental;
    let details;

    await session.withTransaction(async () => {
      // Write to the car document inside this transaction.
      // Competing transactions for the same car will conflict,
      // allowing MongoDB to retry or reject one of them.
      const carId = req.body.carId;

      await Car.updateOne(
        { _id: carId },
        { $inc: { bookingLockVersion: 1 } },
        { session }
      );

      // Recheck availability inside the transaction.
      details = await getRentalDetails({
        ...req.body,
        session
      });

      rental = new Rental({
        car: details.car._id,
        customer: user._id,
        startDate: details.start,
        endDate: details.end,
        durationHours: details.durationHours,
        rentalTier: details.rentalTier,
        pricePerDay: details.baseRate,
        totalAmount: details.totalCalculatedPrice,
        pricingBreakdown: {
          baseRate: details.baseRate,
          durationUnits: details.durationUnits,
          surgeMultiplierApplied:
            details.pricingBreakdown.surgeMultiplierApplied,
          surgeFee: details.pricingBreakdown.surgeFee,
          totalCalculatedPrice:
            details.totalCalculatedPrice
        }
      });

      await rental.save({ session });
    });

    // This runs only after the transaction has committed.
    Promise.resolve()
      .then(() => sendRentalReminder(user, rental, details.car))
      .catch((emailErr) => {
        console.error(
          'Failed to send rental reminder email:',
          emailErr
        );
      });

    return res.status(201).json({
      message: 'Rental booked successfully',
      rental
    });
  } catch (err) {
    if (err instanceof RentalValidationError) {
      return res.status(err.statusCode).json({
        message: err.message,
        ...err.extra
      });
    }

    console.error('Create rental error:', err);

    return res.status(500).json({
      message: 'Internal server error'
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = {
  createRental,
  calculatePriceAndAvailability
};