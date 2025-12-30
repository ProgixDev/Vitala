const express = require('express');
const router = express.Router();
const { approveNurse, rejectNurse, getUser, getAllUsers, updateUserRole } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/users/:id', getUser);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

router.put('/nurses/:id/approve', approveNurse);
router.put('/nurses/:id/reject', rejectNurse);

module.exports = router;
