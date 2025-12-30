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

// Get user by ID or email
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    let user;

    // Check if id is email or ObjectId
    if (id.includes('@')) {
      user = await User.findOne({ email: id }).select('-password -refreshToken');
    } else {
      user = await User.findById(id).select('-password -refreshToken');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType, status } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (userType) user.userType = userType;
    if (status) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message,
    });
  }
};
