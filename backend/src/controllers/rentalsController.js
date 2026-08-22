const Rental = require('../models/Rental');
const Car = require('../models/Car');
const User = require('../models/User');
const { sendRentalReminder } = require('../utils/emailService');

// Controller function to calculate rental pricing and check car availability for selected dates
const calculatePriceAndAvailability = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });    
    const isRentable = car.get('listingType') === 'rent' || car.get('category') === 'rental';
    if (!isRentable) {
      return res.status(400).json({ message: 'Car is not available for rent' });
    }
    if (car.blackoutDates && car.blackoutDates.length > 0) {
      const isBlackedOut = car.blackoutDates.some(
        (b) => start < new Date(b.endDate) && end > new Date(b.startDate)
      );
      if (isBlackedOut) return res.status(409).json({ available: false, message: 'Car is unavailable for these dates.' });
    }
    const overlappingRentals = await Rental.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed', 'active'] }, 
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
        { startDate: { $lt: end }, endDate: { $gt: start } } // Fallback for older documents
      ]
    });
    if (overlappingRentals) return res.status(409).json({ available: false, message: 'Dates are already booked.' });
    const diffInMs = end - start;
    const durationHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    const minHours = car.rentalPricing?.minRentalHours || 2;
    if (durationHours < minHours) {
      return res.status(400).json({ message: `Minimum rental is ${minHours} hours.` });
    }
    let rentalTier = 'hourly';
    let durationUnits = durationHours;
    let baseRate = car.rentalPricing?.hourlyRate || (car.price / 24) || 10; 
    if (durationHours >= 24) {
      rentalTier = 'daily';
      durationUnits = Math.ceil(durationHours / 24);
      baseRate = car.rentalPricing?.dailyRate || car.price || 0;
    }
    const isWeekend = start.getDay() === 0 || start.getDay() === 6;
    const multiplier = isWeekend ? (car.rentalPricing?.weekendMultiplier || 1.0) : 1.0;
    const subtotal = baseRate * durationUnits;
    const totalCalculatedPrice = subtotal * multiplier;
    return res.status(200).json({
      available: true,
      pricingBreakdown: {
        rentalTier,
        durationUnits,
        baseRate,
        surgeMultiplierApplied: multiplier,
        surgeFee: totalCalculatedPrice - subtotal,
        totalCalculatedPrice
      }
    });
  } catch (err) {
    console.error('Calculate pricing error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to update an existing rental booking and manage car availability
const createRental = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Customer access required' });
    }
    const { carId, startDate, endDate } = req.body;
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: 'carId, startDate and endDate are required' });
    }
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const isRentable = car.get('listingType') === 'rent' || car.get('category') === 'rental';
    if (!isRentable) {
      return res.status(400).json({ message: 'Car is not available for rent' });
    }
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e <= s) return res.status(400).json({ message: 'Invalid rental dates' });
    const overlappingRentals = await Rental.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startTime: { $lt: e }, endTime: { $gt: s } },
        { startDate: { $lt: e }, endDate: { $gt: s } } 
      ]
    });
    if (overlappingRentals) {
      return res.status(409).json({ message: 'Car is already booked for these dates' });
    }
    const diffInMs = e - s;
    const durationHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    let rentalTier = 'hourly';
    let durationUnits = durationHours;
    let baseRate = car.rentalPricing?.hourlyRate || (car.price / 24) || 10;
    if (durationHours >= 24) {
      rentalTier = 'daily';
      durationUnits = Math.ceil(durationHours / 24);
      baseRate = car.rentalPricing?.dailyRate || car.price || 0;
    }
    const isWeekend = s.getDay() === 0 || s.getDay() === 6;
    const multiplier = isWeekend ? (car.rentalPricing?.weekendMultiplier || 1.0) : 1.0;
    const subtotal = baseRate * durationUnits;
    const totalAmount = subtotal * multiplier;
    const rental = new Rental({
      car: car._id,
      customer: req.user.userId,
      startDate: s,
      endDate: e,
      startTime: s,
      endTime: e,
      durationHours,
      rentalTier,
      pricePerDay: baseRate, 
      totalAmount,           
      pricingBreakdown: {
        baseRate,
        durationUnits,
        surgeMultiplierApplied: multiplier,
        surgeFee: totalAmount - subtotal,
        totalCalculatedPrice: totalAmount
      }
    });
    await rental.save();
    car.status = 'rented';
    await car.save();
    try {
      const user = await User.findById(req.user.userId);
      if (user) {
        sendRentalReminder(user, rental, car).catch(err => console.error('Failed to send rental reminder email:', err));
      }
    } catch (emailErr) {
      console.error('Error preparing rental email:', emailErr);
    }
    res.status(201).json({ message: 'Rental booked successfully', rental });
  } catch (err) {
    console.error('Create rental error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createRental,
  calculatePriceAndAvailability
};