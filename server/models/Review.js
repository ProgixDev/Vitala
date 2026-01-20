const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

    // Review categories
    categories: {
      professionalism: Number,
      punctuality: Number,
      communication: Number,
      careQuality: Number,
    },

    // Moderation
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedAt: Date,

    isHidden: {
      type: Boolean,
      default: false,
    },

    // Response from nurse
    nurseResponse: {
      comment: String,
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate reviews for the same appointment
reviewSchema.index({ appointment: 1 }, { unique: true });
reviewSchema.index({ nurse: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
