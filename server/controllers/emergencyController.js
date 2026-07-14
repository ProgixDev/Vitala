const EmergencyRequest = require("../models/EmergencyRequest");
const Appointment = require("../models/Appointment");
const EmergencyContact = require("../models/EmergencyContact");
const User = require("../models/User");
const {
  createAndSendNotification,
  sendSMSNotification,
  sendEmailNotification,
} = require("../utils/notificationHelpers");

// @desc    Create emergency nurse alert
// @route   POST /api/emergency/nurse-alert
// @access  Private
exports.createEmergencyNurseAlert = async (req, res) => {
  try {
    const { description, location } = req.body;

    // Create emergency appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      service: "Emergency Nurse Alert",
      appointmentType: "emergency",
      status: "pending",
      scheduledDate: new Date(),
      scheduledTime: {
        start: new Date().toTimeString().slice(0, 5),
      },
      location,
      symptoms: description,
      price: 0,
      duration: 60,
    });

    // Create emergency request record
    const emergencyRequest = await EmergencyRequest.create({
      patient: req.user._id,
      type: "nurse-alert",
      appointment: appointment._id,
      description,
      location,
      status: "pending",
    });

    // Notify available nurses
    const nurses = await User.find({ role: "nurse", isAvailable: true });
    for (const nurse of nurses) {
      await createAndSendNotification({
        userId: nurse._id,
        title: "Emergency Nurse Alert",
        message: `Emergency assistance needed: ${description}`,
        type: "emergency",
        priority: "urgent",
        relatedAppointment: appointment._id,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        appointment,
        emergencyRequest,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating emergency nurse alert",
      error: error.message,
    });
  }
};

// @desc    Create ambulance service request
// @route   POST /api/emergency/ambulance
// @access  Private
exports.createAmbulanceRequest = async (req, res) => {
  try {
    const { description, location } = req.body;

    // Create emergency appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      service: "Ambulance Service",
      appointmentType: "emergency",
      status: "pending",
      scheduledDate: new Date(),
      scheduledTime: {
        start: new Date().toTimeString().slice(0, 5),
      },
      location,
      symptoms: description,
      price: 0,
      duration: 30,
    });

    // Create emergency request record
    const emergencyRequest = await EmergencyRequest.create({
      patient: req.user._id,
      type: "ambulance",
      appointment: appointment._id,
      description,
      location,
      status: "pending",
    });

    // Notify emergency services (this would integrate with actual emergency dispatch)
    await createAndSendNotification({
      userId: req.user._id,
      title: "Ambulance Requested",
      message: "Your ambulance request has been submitted. Help is on the way.",
      type: "emergency",
      priority: "urgent",
      relatedAppointment: appointment._id,
    });

    res.status(201).json({
      success: true,
      data: {
        appointment,
        emergencyRequest,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating ambulance request",
      error: error.message,
    });
  }
};

// @desc    Send family alert notifications
// @route   POST /api/emergency/family-alert
// @access  Private
exports.sendFamilyAlert = async (req, res) => {
  try {
    const { message } = req.body;

    // Get user's emergency contacts
    const contacts = await EmergencyContact.find({ user: req.user._id });

    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No emergency contacts found. Please add emergency contacts first.",
      });
    }

    // Create emergency request record
    const emergencyRequest = await EmergencyRequest.create({
      patient: req.user._id,
      type: "family-alert",
      description: message || "Emergency alert sent to family contacts",
      status: "completed", // Family alerts are sent immediately
      completedAt: new Date(),
    });

    // Send notifications to all emergency contacts
    const notificationPromises = contacts.map(async (contact) => {
      const promises = [];

      // Send SMS to emergency contact if they have a phone number
      if (contact.phoneNumber) {
        promises.push(
          sendSMSNotification({
            to: contact.phoneNumber,
            message: `🚨 EMERGENCY ALERT: ${message || "I need immediate assistance"} - From ${req.user.fullName}. Contact: ${req.user.phoneNumber || "N/A"}`,
          }),
        );
      }

      // Send email to emergency contact if they have an email
      if (contact.email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #EF4444; border-radius: 8px;">
            <h1 style="color: #DC2626; text-align: center;">🚨 EMERGENCY ALERT 🚨</h1>
            <div style="background-color: #FEE2E2; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h2 style="color: #991B1B; margin-top: 0;">Emergency Contact Notification</h2>
              <p style="color: #7F1D1D; font-size: 16px; line-height: 1.6;">
                <strong>${req.user.fullName}</strong> has sent you an emergency alert:
              </p>
              <p style="color: #7F1D1D; font-size: 18px; font-weight: bold; margin: 15px 0;">
                "${message || "I need immediate assistance"}"
              </p>
            </div>
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 4px;">
              <h3 style="color: #374151; margin-top: 0;">Contact Information:</h3>
              <p style="color: #6B7280; margin: 5px 0;"><strong>Name:</strong> ${req.user.fullName}</p>
              <p style="color: #6B7280; margin: 5px 0;"><strong>Phone:</strong> ${req.user.phoneNumber || "Not provided"}</p>
              <p style="color: #6B7280; margin: 5px 0;"><strong>Email:</strong> ${req.user.email}</p>
              <p style="color: #6B7280; margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #EF4444; text-align: center; font-size: 14px; margin-top: 20px;">
              <strong>Please contact them immediately or call emergency services if needed.</strong>
            </p>
          </div>
        `;

        promises.push(
          sendEmailNotification({
            to: contact.email,
            subject: `🚨 EMERGENCY ALERT from ${req.user.fullName}`,
            text: `EMERGENCY ALERT: ${message || "I need immediate assistance"} - From ${req.user.fullName} (${req.user.phoneNumber || "N/A"})`,
            html: emailHtml,
          }),
        );
      }

      // Create a notification for the user about the alert being sent
      promises.push(
        createAndSendNotification({
          userId: req.user._id,
          title: "Family Alert Sent",
          message: `Emergency alert sent to ${contact.name} (${contact.relationship})${contact.phoneNumber ? " via SMS" : ""}${contact.email ? " and email" : ""}`,
          type: "emergency",
          priority: "high",
        }),
      );

      return Promise.all(promises);
    });

    await Promise.all(notificationPromises);

    res.status(200).json({
      success: true,
      message: `Emergency alert sent to ${contacts.length} contact(s)`,
      data: {
        emergencyRequest,
        contactsNotified: contacts.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending family alert",
      error: error.message,
    });
  }
};

// @desc    Get emergency service status
// @route   GET /api/emergency/status/:appointmentId
// @access  Private
exports.getEmergencyStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      patient: req.user._id,
      appointmentType: "emergency",
    }).populate("nurse", "name phoneNumber");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Emergency appointment not found",
      });
    }

    const emergencyRequest = await EmergencyRequest.findOne({
      appointment: req.params.appointmentId,
    });

    res.status(200).json({
      success: true,
      data: {
        appointment,
        emergencyRequest,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching emergency status",
      error: error.message,
    });
  }
};
