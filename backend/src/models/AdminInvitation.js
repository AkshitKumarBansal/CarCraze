const mongoose = require('mongoose');

const adminInvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  usedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

adminInvitationSchema.index({
  email: 1,
  usedAt: 1,
});

module.exports = mongoose.model(
  'AdminInvitation',
  adminInvitationSchema
);