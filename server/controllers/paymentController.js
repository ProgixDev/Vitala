const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

// Service name mapping - matches frontend services data
const serviceNameMap = {
  1: "Rééducation",
  2: "Perfusion",
  3: "Vaccination",
  4: "Analyses",
  5: "Consultation",
  6: "Maternity",
  7: "Pediatric",
  8: "Medication",
  9: "Wound Care",
  10: "Elderly Care",
  11: "Dialysis",
  12: "Respiratory",
  13: "Post-Op Care",
  14: "Injection",
  15: "Palliative",
  16: "Nutrition",
};

// Helper function to get service name from ID
const getServiceName = (serviceId) => {
  if (!serviceId) return "Unknown Service";
  // If it's already a name, return it
  if (typeof serviceId === "string" && !serviceId.match(/^\d+$/)) {
    return serviceId;
  }
  // Look up the service name
  return serviceNameMap[serviceId.toString()] || "Unknown Service";
};

// Mock payment processing
const processPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod, amount } = req.body;
    const userId = req.user._id;

    console.log("Processing payment for appointment:", appointmentId);
    console.log("User ID:", userId);
    console.log("Payment method:", paymentMethod);
    console.log("Amount:", amount);

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log("Appointment not found");
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    console.log("Appointment patient:", appointment.patient);
    console.log(
      "User ID comparison:",
      appointment.patient.toString(),
      userId.toString(),
    );

    if (appointment.patient.toString() !== userId.toString()) {
      console.log("Unauthorized: appointment patient does not match user");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Allow payment for confirmed, in-progress, or completed appointments
    const validPaymentStatuses = ["confirmed", "in-progress", "completed"];
    if (!validPaymentStatuses.includes(appointment.status)) {
      console.log(
        "Appointment status does not allow payment:",
        appointment.status,
      );
      return res
        .status(400)
        .json({
          success: false,
          message: "Appointment must be confirmed before payment",
        });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      appointment: appointmentId,
    });
    if (existingPayment) {
      // If payment is already completed, don't allow another payment
      if (existingPayment.status === "completed") {
        console.log("Payment already completed for this appointment");
        return res
          .status(400)
          .json({
            success: false,
            message: "Payment already completed for this appointment",
          });
      }
      // If payment failed or is pending, allow retry by deleting the old payment
      console.log("Removing existing failed/pending payment to allow retry");
      await Payment.findByIdAndDelete(existingPayment._id);
    }

    // Mock payment processing - simulate success/failure
    const paymentSuccess = Math.random() > 0.1; // 90% success rate
    console.log("Payment success simulation:", paymentSuccess);

    const payment = new Payment({
      appointment: appointmentId,
      user: userId,
      amount,
      paymentMethod,
      status: paymentSuccess ? "completed" : "failed",
      metadata: {
        mockPayment: true,
        processedAt: new Date().toISOString(),
      },
    });

    await payment.save();
    console.log("Payment saved with ID:", payment._id);

    if (paymentSuccess) {
      // Payment successful - no need to update appointment status
      console.log("Payment processed successfully");

      res.status(201).json({
        success: true,
        message: "Payment processed successfully",
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          receiptNumber: payment.receiptNumber,
        },
      });
    } else {
      console.log("Payment failed");
      res.status(400).json({
        success: false,
        message: "Payment failed",
        payment: {
          id: payment._id,
          status: payment.status,
        },
      });
    }
  } catch (error) {
    console.error("Process payment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Save payment method
const savePaymentMethod = async (req, res) => {
  try {
    const { last4, brand, expiryMonth, expiryYear, isDefault } = req.body;
    const userId = req.user.id;

    // Mock saving payment method
    const paymentMethod = {
      id: `pm_mock_${Date.now()}`,
      last4,
      brand,
      expiryMonth,
      expiryYear,
      isDefault: isDefault || false,
      createdAt: new Date(),
    };

    // In a real implementation, this would be saved to a PaymentMethod model
    // For now, we'll just return success

    res.status(201).json({
      message: "Payment method saved successfully",
      paymentMethod,
    });
  } catch (error) {
    console.error("Save payment method error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get saved payment methods
const getSavedPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    // Mock payment methods
    const paymentMethods = [
      {
        id: "pm_mock_1",
        last4: "4242",
        brand: "visa",
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
      },
      {
        id: "pm_mock_2",
        last4: "5555",
        brand: "mastercard",
        expiryMonth: 8,
        expiryYear: 2025,
        isDefault: false,
      },
    ];

    res.json({ paymentMethods });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Set default payment method
const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const userId = req.user.id;

    // Mock implementation
    res.json({
      message: "Default payment method updated successfully",
      paymentMethodId,
    });
  } catch (error) {
    console.error("Set default payment method error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete payment method
const deletePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const userId = req.user.id;

    // Mock implementation
    res.json({
      message: "Payment method deleted successfully",
      paymentMethodId,
    });
  } catch (error) {
    console.error("Delete payment method error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = status;
    if (status === "refunded") {
      payment.refundedAt = new Date();
    }

    await payment.save();

    res.json({
      message: "Payment status updated successfully",
      payment: {
        id: payment._id,
        status: payment.status,
        refundedAt: payment.refundedAt,
      },
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get payment by appointment ID
const getPaymentByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const payment = await Payment.findOne({ appointment: appointmentId })
      .populate("appointment", "date time service status")
      .populate("user", "name email");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Get payment by appointment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate payment receipt
const generateReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate("appointment", "date time service")
      .populate("user", "name email");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Mock receipt generation
    const receipt = {
      receiptNumber: payment.receiptNumber,
      paymentId: payment._id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      date: payment.createdAt,
      customer: {
        name: payment.user.name,
        email: payment.user.email,
      },
      appointment: {
        id: payment.appointment._id,
        date: payment.appointment.date,
        time: payment.appointment.time,
        service: payment.appointment.service,
      },
    };

    // In a real implementation, this would generate a PDF
    payment.receiptUrl = `https://api.vitala.com/receipts/${payment.receiptNumber}.pdf`;
    await payment.save();

    res.json({
      message: "Receipt generated successfully",
      receipt,
      receiptUrl: payment.receiptUrl,
    });
  } catch (error) {
    console.error("Generate receipt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Download receipt PDF (mock)
const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Mock PDF download - in reality, this would serve the actual PDF file
    res.json({
      message: "Receipt download initiated",
      receiptUrl:
        payment.receiptUrl ||
        `https://api.vitala.com/receipts/${payment.receiptNumber}.pdf`,
    });
  } catch (error) {
    console.error("Download receipt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Only completed payments can be refunded" });
    }

    // Mock refund processing
    const refundAmount = amount || payment.amount;
    payment.status = "refunded";
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();

    await payment.save();

    res.json({
      message: "Refund processed successfully",
      refund: {
        paymentId: payment._id,
        amount: refundAmount,
        reason,
        refundedAt: payment.refundedAt,
      },
    });
  } catch (error) {
    console.error("Process refund error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user transactions (payments)
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, type, limit = 50 } = req.query;

    let query = { user: userId };

    // Filter by status if provided
    if (status && status !== "all") {
      query.status = status;
    }

    // Get all payments for the user
    const payments = await Payment.find(query)
      .populate({
        path: "appointment",
        select: "service serviceName scheduledDate price",
        populate: {
          path: "service",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Transform payments to transaction format
    const transactions = payments.map((payment) => {
      // Get service name from appointment
      let serviceName = "Unknown Service";
      if (payment.appointment?.serviceName) {
        serviceName = payment.appointment.serviceName;
      } else if (payment.appointment?.service) {
        // Use the service ID to look up the name
        serviceName = getServiceName(payment.appointment.service);
      }

      return {
        id: payment._id,
        type: payment.status === "refunded" ? "refund" : "payment",
        service: serviceName,
        amount: payment.amount,
        currency: payment.currency || "USD",
        date: payment.createdAt,
        status: payment.status,
        paymentMethod:
          payment.paymentMethod === "credit_card" ? "Credit Card" : "PayPal",
        receiptNumber: payment.receiptNumber,
        appointmentId: payment.appointment?._id,
      };
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findById(transactionId).populate({
      path: "appointment",
      select: "service serviceName scheduledDate price patient",
      populate: {
        path: "service",
        select: "name",
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check if user owns this transaction
    if (payment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this transaction",
      });
    }

    // Get service name from appointment
    let serviceName = "Unknown Service";
    if (payment.appointment?.serviceName) {
      serviceName = payment.appointment.serviceName;
    } else if (payment.appointment?.service) {
      // Use the service ID to look up the name
      serviceName = getServiceName(payment.appointment.service);
    }

    const transaction = {
      id: payment._id,
      type: payment.status === "refunded" ? "refund" : "payment",
      service: serviceName,
      amount: payment.amount,
      currency: payment.currency || "USD",
      date: payment.createdAt,
      status: payment.status,
      paymentMethod:
        payment.paymentMethod === "credit_card" ? "Credit Card" : "PayPal",
      receiptNumber: payment.receiptNumber,
      appointmentId: payment.appointment?._id,
      metadata: payment.metadata,
    };

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Get transaction by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Calculate user spending statistics
const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all payments for the user
    const payments = await Payment.find({ user: userId });

    // Calculate total spent (completed payments only)
    const totalSpent = payments
      .filter((p) => p.status === "completed" && p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate total refunds
    const totalRefunds = payments
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + p.amount, 0);

    // Count transactions by status
    const completedCount = payments.filter(
      (p) => p.status === "completed",
    ).length;
    const pendingCount = payments.filter((p) => p.status === "pending").length;
    const failedCount = payments.filter((p) => p.status === "failed").length;

    res.status(200).json({
      success: true,
      data: {
        totalSpent,
        totalRefunds,
        netSpent: totalSpent - totalRefunds,
        totalTransactions: payments.length,
        completedCount,
        pendingCount,
        failedCount,
        currency: "USD",
      },
    });
  } catch (error) {
    console.error("Get user statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  processPayment,
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
};
