const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: String,
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ["normal", "emergency"],
      default: "normal",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "on-the-way",
        "in-progress",
        "completed",
        "cancelled",
        "declined",
      ],
      default: "pending",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      start: {
        type: String,
        required: true,
      },
      end: String,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      label: String,
    },
    symptoms: String,
    notes: String,
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },

    // Real-time tracking
    nurseLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },

    // Completion details
    completionNotes: String,
    completedAt: Date,

    // Cancellation details
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledAt: Date,

    // Payment reference
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ nurse: 1, status: 1 });
appointmentSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
