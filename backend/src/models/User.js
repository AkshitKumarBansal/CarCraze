const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true 
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: { 
    type: String, 
    enum: ['customer', 'seller', 'admin'],
    default: 'customer',
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date 
  },
  businessInfo: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  // Additional fields for sellers
  inventory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car'
  }],
  salesHistory: [{
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car'
    },
    soldAt: Date,
    price: Number
  }],
  rating: {
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    documents: [String]
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
