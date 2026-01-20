const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  acceptAppointment,
  declineAppointment,
  assignNurse,
  deleteAppointment,
  getAvailableTimeSlots,
  checkNurseAvailability,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router
  .route("/")
  .get(getAppointments)
  .post(authorize("patient"), createAppointment);

router.route("/:id").get(getAppointmentById).delete(deleteAppointment);

router.put("/:id/status", updateAppointmentStatus);
router.put("/:id/cancel", cancelAppointment);
router.put("/:id/accept", authorize("nurse"), acceptAppointment);
router.put("/:id/decline", authorize("nurse"), declineAppointment);
router.put("/:id/assign-nurse", authorize("admin"), assignNurse);

// Additional routes
router.get("/available-slots", getAvailableTimeSlots);
router.get("/check-availability", checkNurseAvailability);

module.exports = router;
