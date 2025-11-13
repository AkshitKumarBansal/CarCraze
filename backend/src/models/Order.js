const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod','online','upi'], default: 'online' },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  status: { type: String, enum: ['created','processing','completed','cancelled'], default: 'created' },
  // estimated delivery date for the order
  deliveryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
