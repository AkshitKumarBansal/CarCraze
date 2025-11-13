const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Virtual to compute total
cartSchema.virtual('total').get(function() {
  return this.items.reduce((sum, it) => sum + (it.price || 0), 0);
});

module.exports = mongoose.model('Cart', cartSchema);
