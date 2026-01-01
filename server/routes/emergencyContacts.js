const express = require('express');
const router = express.Router();
const {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} = require('../controllers/emergencyContactController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getEmergencyContacts).post(addEmergencyContact);
router.route('/:id').put(updateEmergencyContact).delete(deleteEmergencyContact);

module.exports = router;