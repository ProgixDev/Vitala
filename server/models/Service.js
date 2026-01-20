const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide service name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide service description"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "general-care",
        "wound-care",
        "elderly-care",
        "post-surgery",
        "medication-administration",
        "vital-monitoring",
        "emergency",
        "other",
      ],
    },
    price: {
      type: Number,
      required: [true, "Please provide service price"],
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 60,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    icon: String,
    image: String,
    requirements: [String],

    // Pricing tiers
    pricingTiers: [
      {
        duration: Number, // in minutes
        price: Number,
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Service", serviceSchema);
