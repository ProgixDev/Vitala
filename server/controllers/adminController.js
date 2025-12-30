const User = require('../models/User');

// Approve nurse account
exports.approveNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.userType !== 'nurse') {
      return res.status(404).json({ success: false, message: 'Nurse not found' });
    }
    user.nurseProfile = user.nurseProfile || {};
    user.nurseProfile.verificationStatus = 'approved';
    user.status = 'active';
    user.nurseProfile.rejectionReason = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Nurse approved', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving nurse', error: error.message });
  }
};

// Reject nurse account
exports.rejectNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findById(id);
    if (!user || user.userType !== 'nurse') {
      return res.status(404).json({ success: false, message: 'Nurse not found' });
    }
    user.nurseProfile = user.nurseProfile || {};
    user.nurseProfile.verificationStatus = 'rejected';
    user.nurseProfile.rejectionReason = reason || 'Not specified';
    user.status = 'rejected';
    await user.save();
    res.status(200).json({ success: true, message: 'Nurse rejected', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting nurse', error: error.message });
  }
};
