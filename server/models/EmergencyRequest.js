const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["nurse-alert", "ambulance", "family-alert"],
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "dispatched",
        "en-route",
        "on-scene",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    assignedPersonnel: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    eta: Date,
    completedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("EmergencyRequest", emergencyRequestSchema);
