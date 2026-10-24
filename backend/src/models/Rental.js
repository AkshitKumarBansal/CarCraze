
const mongoose = require('mongoose');

const pricingBreakdownSchema = new mongoose.Schema(
  {
    baseRate: {
      type: Number,
      required: true,
      min: 0
    },
    durationUnits: {
      type: Number,
      required: true,
      min: 1
    },
    surgeMultiplierApplied: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    surgeFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalCalculatedPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const rentalSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },

    durationHours: {
      type: Number,
      required: true,
      min: 1
    },

    rentalTier: {
      type: String,
      enum: ['hourly', 'daily'],
      required: true
    },

    pricePerDay: {
      type: Number,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    pricingBreakdown: {
      type: pricingBreakdownSchema,
      required: true
    },

    status: {
      type: String,
      enum: ['booked', 'active', 'completed', 'cancelled'],
      default: 'booked'
    },

    preInspectionPhotos: [{ type: String }],
    postInspectionPhotos: [{ type: String }],

    depositAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    depositStatus: {
      type: String,
      enum: ['pending', 'held', 'refunded', 'deducted'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Rental', rentalSchema);