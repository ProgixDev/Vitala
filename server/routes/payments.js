const express = require('express');
const router = express.Router();
const {
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
  getUserStatistics
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Payment processing
router.post('/process', processPayment);

// Transactions
router.get('/transactions', getUserTransactions);
router.get('/transactions/:transactionId', getTransactionById);
router.get('/statistics', getUserStatistics);

// Payment methods
router.post('/methods', savePaymentMethod);
router.get('/methods', getSavedPaymentMethods);
router.put('/methods/:paymentMethodId/default', setDefaultPaymentMethod);
router.delete('/methods/:paymentMethodId', deletePaymentMethod);

// Payment management
router.put('/:paymentId/status', updatePaymentStatus);
router.get('/appointment/:appointmentId', getPaymentByAppointment);

// Receipts
router.post('/:paymentId/receipt', generateReceipt);
router.get('/:paymentId/receipt/download', downloadReceipt);

// Refunds
router.post('/:paymentId/refund', processRefund);

module.exports = router;