const EmergencyContact = require("../models/EmergencyContact");
const { createAndSendNotification } = require("../utils/notificationHelpers");

// @desc    Get user's emergency contacts
// @route   GET /api/emergency-contacts
// @access  Private
exports.getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user._id }).sort({
      isPrimary: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching emergency contacts",
      error: error.message,
    });
  }
};

// @desc    Add emergency contact
// @route   POST /api/emergency-contacts
// @access  Private
exports.addEmergencyContact = async (req, res) => {
  try {
    const {
      name,
      relationship,
      phoneNumber,
      email,
      isPrimary,
      address,
      notes,
    } = req.body;

    // If setting as primary, unset other primary contacts
    if (isPrimary) {
      await EmergencyContact.updateMany(
        { user: req.user._id, isPrimary: true },
        { isPrimary: false },
      );
    }

    const contact = await EmergencyContact.create({
      user: req.user._id,
      name,
      relationship,
      phoneNumber,
      email,
      isPrimary: isPrimary || false,
      address,
      notes,
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding emergency contact",
      error: error.message,
    });
  }
};

// @desc    Update emergency contact
// @route   PUT /api/emergency-contacts/:id
// @access  Private
exports.updateEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found",
      });
    }

    const { isPrimary, ...updateData } = req.body;

    // If setting as primary, unset other primary contacts
    if (isPrimary) {
      await EmergencyContact.updateMany(
        { user: req.user._id, _id: { $ne: req.params.id }, isPrimary: true },
        { isPrimary: false },
      );
    }

    const updatedContact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      { ...updateData, isPrimary: isPrimary || false },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating emergency contact",
      error: error.message,
    });
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/emergency-contacts/:id
// @access  Private
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Emergency contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting emergency contact",
      error: error.message,
    });
  }
};
