const express = require('express');
const router = express.Router();
const {
  createEmergencyNurseAlert,
  createAmbulanceRequest,
  sendFamilyAlert,
  getEmergencyStatus,
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/nurse-alert', createEmergencyNurseAlert);
router.post('/ambulance', createAmbulanceRequest);
router.post('/family-alert', sendFamilyAlert);
router.get('/status/:appointmentId', getEmergencyStatus);

module.exports = router;
