const mongoose = require('mongoose');
const Rental = require('../models/Rental');

describe('Rental Model Schema', () => {
  it('should throw validation error if required fields are missing', () => {
    const rental = new Rental({
      durationHours: 24
      // Missing car, user, startTime, endTime, pricingBreakdown
    });

    const error = rental.validateSync();
    
    expect(error.errors.car).toBeDefined();
    expect(error.errors.startTime).toBeDefined();
    expect(error.errors.pricingBreakdown).toBeDefined();
  });

  it('should apply default values correctly', () => {
    const rental = new Rental({
      car: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      startTime: new Date(),
      endTime: new Date(),
      durationHours: 10,
      rentalTier: 'hourly',
      pricingBreakdown: {
        baseRate: 15,
        durationUnits: 10,
        totalCalculatedPrice: 150
      }
    });

    expect(rental.status).toBe('pending');
    expect(rental.paymentStatus).toBe('unpaid');
    expect(rental.pricingBreakdown.surgeFee).toBe(0);
  });
});