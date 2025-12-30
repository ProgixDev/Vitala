const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  acceptAppointment,
  declineAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(authorize('patient'), createAppointment);

router.route('/:id')
  .get(getAppointmentById);

router.put('/:id/status', updateAppointmentStatus);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/accept', authorize('nurse'), acceptAppointment);
router.put('/:id/decline', authorize('nurse'), declineAppointment);

module.exports = router;
