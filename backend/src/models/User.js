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
  isBanned: {
    type: Boolean,
    default: false
  },
  lastLogin: { 
    type: Date 
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    success: Boolean
  }],
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
  
  // UPDATED: ID & Driving License Verification fields
  verification: {
    isVerified: { type: Boolean, default: false },
    
    // 1st Option: Overall verification state
    status: { 
      type: String, 
      enum: ['unverified', 'verified'], 
      default: 'unverified' 
    },
    
    // 2nd Option: Document review process
    reviewStatus: { 
      type: String, 
      enum: ['none', 'pending', 'approved', 'rejected'], 
      default: 'none' 
    },
    
    idDocumentUrl: { type: String, trim: true, default: null },
    drivingLicenseUrl: { type: String, trim: true, default: null },
    submittedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null } 
  },

  // Wishlist - saved/favourite cars
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],

  // Password reset token fields
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }
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