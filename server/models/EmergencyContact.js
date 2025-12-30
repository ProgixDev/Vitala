const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide contact name'],
      trim: true,
    },
    relationship: {
      type: String,
      required: [true, 'Please provide relationship'],
      enum: [
        'spouse',
        'parent',
        'child',
        'sibling',
        'friend',
        'guardian',
        'other',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    address: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
