const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "stripe", "cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    paypalOrderId: String,

    // Receipt
    receiptUrl: String,
    receiptNumber: String,

    // Refund details
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,

    // Payment method details (saved for future use)
    savedPaymentMethod: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
      isDefault: Boolean,
    },

    // Metadata
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  },
);

// Generate receipt number before saving
paymentSchema.pre("save", async function (next) {
  if (this.isNew && !this.receiptNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.receiptNumber = `REC-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
