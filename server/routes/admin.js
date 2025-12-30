const express = require('express');
const router = express.Router();
const { approveNurse, rejectNurse } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.put('/nurses/:id/approve', approveNurse);
router.put('/nurses/:id/reject', rejectNurse);

module.exports = router;
