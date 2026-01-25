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
  assignSelf,
  deleteAppointment,
  getAvailableTimeSlots,
  checkNurseAvailability,
  getUnassignedAppointments,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router
  .route("/")
  .get(getAppointments)
  .post(authorize("patient"), createAppointment);
router.get("/unassigned", authorize("nurse"), getUnassignedAppointments);
router.get("/available-slots", getAvailableTimeSlots);
router.get("/check-availability", checkNurseAvailability);

router.route("/:id").get(getAppointmentById).delete(deleteAppointment);

router.put("/:id/status", updateAppointmentStatus);
router.put("/:id/cancel", cancelAppointment);
router.put("/:id/accept", authorize("nurse"), acceptAppointment);
router.put("/:id/decline", authorize("nurse"), declineAppointment);
router.put("/:id/assign-nurse", authorize("admin"), assignNurse);
router.put("/:id/assign-self", authorize("nurse"), assignSelf);

module.exports = router;
