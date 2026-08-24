const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },
  transactionType: { 
    type: String, 
    enum: ['purchase', 'rental_payment', 'security_deposit'], 
    default: 'purchase' 
  },
  depositAction: { 
    type: String, 
    enum: ['none', 'hold', 'capture', 'release'], 
    default: 'none' 
  },
  price: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'cancelled', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Transaction', transactionSchema);