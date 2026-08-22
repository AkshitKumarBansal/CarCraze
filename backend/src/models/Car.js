const mongoose = require('mongoose');

const blackoutDateSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, default: 'maintenance' }
}, { _id: false });

const carSchema = new mongoose.Schema({
  // --- Original Fields ---
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number },
  price: { type: Number, required: true }, // This was missing!
  description: { type: String },
  fuelType: { type: String },
  transmission: { type: String },
  capacity: { type: Number },
  color: { type: String },
  mileage: { type: Number },
  location: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  deliveryConfig: {
    type: { type: String, enum: ['pickup', 'delivery', 'anywhere', 'radius', 'polygon'] },
    radiusKm: { type: Number }
  },
  listingType: { type: String },
  category: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // --- New Rental Pricing Configuration ---
  rentalPricing: {
    hourlyRate: { type: Number, default: null },
    dailyRate: { type: Number, default: null },
    weekendMultiplier: { type: Number, default: 1.0 },
    holidayMultiplier: { type: Number, default: 1.0 },
    minRentalHours: { type: Number, default: 2 }
  },

  // Blackout dates for maintenance or manual blocks
  blackoutDates: [blackoutDateSchema],

  status: { type: String, default: 'active' },
  images: [{ type: String }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Car', carSchema);