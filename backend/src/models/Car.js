const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  color: String,
  capacity: Number,
  fuelType: String,
  transmission: String,
  description: String,
  listingType: { type: String, enum: ['sale_new', 'sale_old', 'rent'], default: 'sale_old' },
  price: { type: Number, required: true },
  mileage: Number,
  location: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  locationGeo: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  deliveryConfig: {
    type: { type: String, enum: ['pickup', 'anywhere', 'radius', 'polygon'], default: 'anywhere' },
    radiusKm: { type: Number },
    polygon: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]], index: '2dsphere' } // [longitude, latitude] arrays
    }
  },
  images: [String], // URLs or file paths
  availability: {
    startDate: Date,
    endDate: Date
  },
  status: { type: String, enum: ['active', 'sold', 'rented', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
