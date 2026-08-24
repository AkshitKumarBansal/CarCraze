const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  pricePerDay: Number,
  totalAmount: Number,
  status: { type: String, enum: ['booked', 'active', 'completed', 'cancelled'], default: 'booked' },
  preInspectionPhotos: [{ type: String }],
  postInspectionPhotos: [{ type: String }], 
  depositAmount: { type: Number, required: true, default: 0 },
  depositStatus: { 
    type: String, 
    enum: ['pending', 'held', 'refunded', 'deducted'], 
    default: 'pending' 
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rental', rentalSchema);