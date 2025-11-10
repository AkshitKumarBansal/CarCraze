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
  images: [String], // URLs or file paths
  availability: {
    startDate: Date,
    endDate: Date
  },
  status: { type: String, enum: ['active', 'sold', 'rented', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
