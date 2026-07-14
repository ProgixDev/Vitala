const express = require("express");
const router = express.Router();
const {
  getStripeConfig,
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  savePaymentMethod,
  getSavedPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  updatePaymentStatus,
  getPaymentByAppointment,
  generateReceipt,
  downloadReceipt,
  processRefund,
  getUserTransactions,
  getTransactionById,
  getUserStatistics,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Stripe webhook - must be before body parsers and auth middleware
// Raw body is needed for signature verification
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// All routes below require authentication
router.use(protect);

// Stripe configuration
router.get("/config", getStripeConfig);

// Payment intent creation and confirmation
router.post("/create-intent", createPaymentIntent);
router.post("/confirm", confirmPayment);

// Transactions
router.get("/transactions", getUserTransactions);
router.get("/transactions/:transactionId", getTransactionById);
router.get("/statistics", getUserStatistics);

// Payment methods
router.post("/methods", savePaymentMethod);
router.get("/methods", getSavedPaymentMethods);
router.put("/methods/:paymentMethodId/default", setDefaultPaymentMethod);
router.delete("/methods/:paymentMethodId", deletePaymentMethod);

// Payment management
router.put("/:paymentId/status", updatePaymentStatus);
router.get("/appointment/:appointmentId", getPaymentByAppointment);

// Receipts
router.post("/:paymentId/receipt", generateReceipt);
router.get("/:paymentId/receipt/download", downloadReceipt);

// Refunds
router.post("/:paymentId/refund", processRefund);

module.exports = router;
