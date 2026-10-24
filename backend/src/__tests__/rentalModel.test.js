
const mongoose = require('mongoose');
const Rental = require('../models/Rental');

describe('Rental Model Schema', () => {
  const validRentalData = () => ({
    car: new mongoose.Types.ObjectId(),
    customer: new mongoose.Types.ObjectId(),
    startDate: new Date('2026-11-01T10:00:00Z'),
    endDate: new Date('2026-11-02T10:00:00Z'),
    durationHours: 24,
    rentalTier: 'daily',
    pricePerDay: 150,
    totalAmount: 150,
    pricingBreakdown: {
      baseRate: 150,
      durationUnits: 1,
      surgeMultiplierApplied: 1,
      surgeFee: 0,
      totalCalculatedPrice: 150
    }
  });

  it('should throw validation errors if required fields are missing', () => {
    const rental = new Rental({
      durationHours: 24
    });

    const error = rental.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.car).toBeDefined();
    expect(error.errors.customer).toBeDefined();
    expect(error.errors.startDate).toBeDefined();
    expect(error.errors.endDate).toBeDefined();
    expect(error.errors.rentalTier).toBeDefined();
    expect(error.errors.totalAmount).toBeDefined();
    expect(error.errors.pricingBreakdown).toBeDefined();
  });

  it('should apply default values correctly', () => {
    const rental = new Rental(validRentalData());

    expect(rental.status).toBe('booked');
    expect(rental.depositAmount).toBe(0);
    expect(rental.depositStatus).toBe('pending');
    expect(rental.pricingBreakdown.surgeMultiplierApplied).toBe(1);
    expect(rental.pricingBreakdown.surgeFee).toBe(0);
  });

  it('should accept a valid rental', () => {
    const rental = new Rental(validRentalData());

    const error = rental.validateSync();

    expect(error).toBeUndefined();
  });

  it('should reject an invalid rental status', () => {
    const rental = new Rental({
      ...validRentalData(),
      status: 'pending'
    });

    const error = rental.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });

  it('should reject an invalid rental tier', () => {
    const rental = new Rental({
      ...validRentalData(),
      rentalTier: 'weekly'
    });

    const error = rental.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.rentalTier).toBeDefined();
  });

  it('should reject an end date earlier than the start date', () => {
    const rental = new Rental({
      ...validRentalData(),
      endDate: new Date('2026-10-31T10:00:00Z')
    });

    const error = rental.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.endDate).toBeDefined();
  });

  it('should reject negative rental amounts', () => {
    const rental = new Rental({
      ...validRentalData(),
      totalAmount: -100
    });

    const error = rental.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.totalAmount).toBeDefined();
  });

  it('should automatically set createdAt and updatedAt', () => {
    expect(Rental.schema.options.timestamps).toBe(true);
  });
});
