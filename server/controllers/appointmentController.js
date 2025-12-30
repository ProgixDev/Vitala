const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res) => {
  try {
    const {
      service,
      appointmentType,
      scheduledDate,
      scheduledTime,
      location,
      symptoms,
      notes,
      price,
      duration,
      nurse,
    } = req.body;

    const appointment = await Appointment.create({
      patient: req.user._id,
      nurse,
      service,
      appointmentType,
      scheduledDate,
      scheduledTime,
      location,
      symptoms,
      notes,
      price,
      duration,
      status: appointmentType === 'emergency' ? 'pending' : 'pending',
    });

    await appointment.populate('patient service nurse');

    // Create notification for nurse if assigned
    if (nurse) {
      await Notification.create({
        user: nurse,
        title: 'New Appointment Request',
        message: `You have a new ${appointmentType} appointment request`,
        type: 'appointment',
        relatedAppointment: appointment._id,
      });
    }

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message,
    });
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = {};
    
    // Filter by user type
    if (req.user.userType === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.userType === 'nurse') {
      query.nurse = req.user._id;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by type
    if (type) {
      query.appointmentType = type;
    }

    const appointments = await Appointment.find(query)
      .populate('patient nurse service')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message,
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient nurse service');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user is authorized
    if (
      appointment.patient.toString() !== req.user._id.toString() &&
      appointment.nurse?.toString() !== req.user._id.toString() &&
      req.user.userType !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message,
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = status;
    
    if (status === 'completed') {
      appointment.completedAt = new Date();
    }
    
    await appointment.save();
    await appointment.populate('patient nurse service');

    // Create notification
    const notifyUser = status === 'confirmed' || status === 'on-the-way' 
      ? appointment.patient 
      : appointment.nurse;
      
    if (notifyUser) {
      await Notification.create({
        user: notifyUser,
        title: 'Appointment Status Updated',
        message: `Appointment status changed to ${status}`,
        type: 'appointment',
        relatedAppointment: appointment._id,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message,
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();
    
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message,
    });
  }
};

// @desc    Accept appointment (Nurse)
// @route   PUT /api/appointments/:id/accept
// @access  Private (Nurse)
exports.acceptAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.nurse?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    // Notify patient
    await Notification.create({
      user: appointment.patient,
      title: 'Appointment Confirmed',
      message: 'Your appointment has been confirmed',
      type: 'appointment',
      relatedAppointment: appointment._id,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting appointment',
      error: error.message,
    });
  }
};

// @desc    Decline appointment (Nurse)
// @route   PUT /api/appointments/:id/decline
// @access  Private (Nurse)
exports.declineAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = 'declined';
    appointment.cancellationReason = reason;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment declined',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error declining appointment',
      error: error.message,
    });
  }
};
