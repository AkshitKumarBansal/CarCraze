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
  images: [{ type: String }],

  // Used to coordinate concurrent booking transactions
  bookingLockVersion: {
    type: Number,
    default: 0
  },

  locationGeo: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function (coordinates) {
          if (coordinates == null) return true;

          return (
            Array.isArray(coordinates) &&
            coordinates.length === 2 &&
            coordinates.every(Number.isFinite) &&
            coordinates[0] >= -180 &&
            coordinates[0] <= 180 &&
            coordinates[1] >= -90 &&
            coordinates[1] <= 90
          );
        },
        message: 'Invalid GeoJSON coordinates'
      }
    }
  }

}, { 
  timestamps: true 
});

carSchema.index({ locationGeo: '2dsphere' });

module.exports = mongoose.model('Car', carSchema);