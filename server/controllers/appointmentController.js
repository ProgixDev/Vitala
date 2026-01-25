const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Notification = require("../models/Notification");

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
      price,
      duration,
    } = req.body;

    const appointment = await Appointment.create({
      patient: req.user._id,
      service,
      appointmentType,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      location,
      price,
      duration,
      status: appointmentType === "emergency" ? "pending" : "pending",
    });

    // Create payment along with appointment
    const payment = await Payment.create({
      appointment: appointment._id,
      user: req.user._id,
      amount: price,
      currency: "USD",
      status: "pending",
    });

    // Set payment reference in appointment
    appointment.payment = payment._id;
    await appointment.save();

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating appointment",
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
    if (req.user.userType === "patient") {
      query.patient = req.user._id;
    } else if (req.user.userType === "nurse") {
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
      .populate("patient", "fullName email userType")
      .populate("nurse", "fullName email userType")
      .populate("payment", "amount currency status")
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
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
      .populate("patient", "fullName email userType medicalProfile")
      .populate("nurse", "fullName email userType")
      .populate("payment");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    res.status(200).json({
      success: true,
      data: appointment.toObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching appointment",
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
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "fullName email userType medicalProfile")
      .populate("nurse", "fullName email userType")
      .populate("payment");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;

    if (status === "completed") {
      appointment.completedAt = new Date();
    }

    await appointment.save();

    // Create notification
    const notifyUser =
      status === "confirmed" || status === "on-the-way"
        ? appointment.patient
        : appointment.nurse;

    if (notifyUser) {
      await Notification.create({
        user: notifyUser,
        title: "Appointment Status Updated",
        message: `Appointment status changed to ${status}`,
        type: "appointment",
        relatedAppointment: appointment._id,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment status",
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
        message: "Appointment not found",
      });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = reason;
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();

    await appointment.save();

    // Cancel associated payment if it's pending
    if (appointment.payment) {
      const payment = await Payment.findById(appointment.payment);
      if (payment && payment.status === "pending") {
        payment.status = "cancelled";
        await payment.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling appointment",
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
        message: "Appointment not found",
      });
    }

    if (appointment.nurse?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    appointment.status = "confirmed";
    await appointment.save();

    // Notify patient
    await Notification.create({
      user: appointment.patient,
      title: "Appointment Confirmed",
      message: "Your appointment has been confirmed",
      type: "appointment",
      relatedAppointment: appointment._id,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accepting appointment",
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
        message: "Appointment not found",
      });
    }

    appointment.status = "declined";
    appointment.cancellationReason = reason;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment declined",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error declining appointment",
      error: error.message,
    });
  }
};

// @desc    Assign nurse to appointment
// @route   PUT /api/appointments/:id/assign-nurse
// @access  Private (Admin)
exports.assignNurse = async (req, res) => {
  try {
    const { nurseId } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if nurse exists and is approved
    const nurse = await User.findById(nurseId)
      .populate("patient", "fullName email userType")
      .populate("nurse", "fullName email userType")
      .populate("payment");
    if (
      !nurse ||
      nurse.userType !== "nurse" ||
      nurse.nurseProfile.verificationStatus !== "approved"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid nurse",
      });
    }

    appointment.nurse = nurseId;
    await appointment.save();

    // Create notification for nurse
    await Notification.create({
      user: nurseId,
      title: "Appointment Assigned",
      message: "You have been assigned to a new appointment",
      type: "appointment",
      relatedAppointment: appointment._id,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error assigning nurse",
      error: error.message,
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if user is authorized (patient can delete their own, admin can delete any)
    if (
      appointment.patient.toString() !== req.user._id.toString() &&
      req.user.userType !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this appointment",
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting appointment",
      error: error.message,
    });
  }
};

// @desc    Get available time slots for a date
// @route   GET /api/appointments/available-slots
// @access  Private
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { date, serviceId, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all appointments for this date
    const existingAppointments = await Appointment.find({
      scheduledDate: {
        $gte: targetDate,
        $lt: nextDay,
      },
      status: { $in: ["pending", "confirmed", "on-the-way", "in-progress"] },
    });

    // Define available time slots (9 AM to 5 PM)
    const timeSlots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const slotEndHour = minute + parseInt(duration) >= 60 ? hour + 1 : hour;
        const slotEndMinute = (minute + parseInt(duration)) % 60;
        const slotEnd = `${slotEndHour.toString().padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}`;

        // Check if this slot conflicts with existing appointments
        const isAvailable = !existingAppointments.some((appointment) => {
          const aptStart = appointment.scheduledTime.start;
          const aptEnd =
            appointment.scheduledTime.end ||
            (() => {
              const [h, m] = aptStart.split(":").map(Number);
              const endTime = new Date();
              endTime.setHours(h, m + appointment.duration);
              return `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;
            })();

          return (
            (slotStart >= aptStart && slotStart < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (slotStart <= aptStart && slotEnd >= aptEnd)
          );
        });

        timeSlots.push({
          time: slotStart,
          available: isAvailable,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: timeSlots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching available time slots",
      error: error.message,
    });
  }
};

// @desc    Check nurse availability
// @route   GET /api/appointments/check-availability
// @access  Private
exports.checkNurseAvailability = async (req, res) => {
  try {
    const { nurseId, date, startTime, duration = 60 } = req.query;

    if (!nurseId || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Nurse ID, date, and start time are required",
      });
    }

    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check nurse's availability schedule
    const nurse = await User.findById(nurseId);
    if (!nurse || nurse.userType !== "nurse") {
      return res.status(404).json({
        success: false,
        message: "Nurse not found",
      });
    }

    const dayOfWeek = targetDate.toLocaleLowerCase("en-US", {
      weekday: "long",
    });
    const nurseAvailability = nurse.nurseProfile.availability[dayOfWeek];

    if (!nurseAvailability || nurseAvailability.length === 0) {
      return res.status(200).json({
        success: true,
        available: false,
        reason: "Nurse is not available on this day",
      });
    }

    // Check if requested time falls within nurse's availability
    const requestedStart = startTime;
    const requestedEnd = (() => {
      const [h, m] = requestedStart.split(":").map(Number);
      const endTime = new Date();
      endTime.setHours(h, m + parseInt(duration));
      return `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;
    })();

    const isWithinAvailability = nurseAvailability.some((slot) => {
      return requestedStart >= slot.start && requestedEnd <= slot.end;
    });

    if (!isWithinAvailability) {
      return res.status(200).json({
        success: true,
        available: false,
        reason: "Requested time is outside nurse's availability",
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      nurse: nurseId,
      scheduledDate: {
        $gte: targetDate,
        $lt: nextDay,
      },
      status: { $in: ["pending", "confirmed", "on-the-way", "in-progress"] },
      $or: [
        {
          "scheduledTime.start": { $lt: requestedEnd },
          "scheduledTime.end": { $gt: requestedStart },
        },
      ],
    });

    const available = !conflictingAppointment;

    res.status(200).json({
      success: true,
      available,
      reason: available ? null : "Nurse has a conflicting appointment",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking nurse availability",
      error: error.message,
    });
  }
};

// @desc    Get unassigned appointments
// @route   GET /api/appointments/unassigned
// @access  Private (Nurse)
exports.getUnassignedAppointments = async (req, res) => {
  console.log("Fetching unassigned appointments...");
  try {
    const appointments = await Appointment.find({
      nurse: { $exists: false },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("patient", "fullName email userType")
      .populate("payment")
      .sort({ scheduledDate: -1 });

    console.log(appointments);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching unassigned appointments",
      error: error.message,
    });
  }
};

// @desc    Assign self to appointment
// @route   PUT /api/appointments/:id/assign-self
// @access  Private (Nurse)
exports.assignSelf = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "fullName email userType")
      .populate("nurse", "fullName email userType")
      .populate("payment");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.nurse) {
      return res.status(400).json({
        success: false,
        message: "Appointment already assigned",
      });
    }

    appointment.nurse = req.user._id;
    await appointment.save();

    // Create notification for patient
    await Notification.create({
      user: appointment.patient,
      title: "Nurse Assigned",
      message: "A nurse has been assigned to your appointment",
      type: "appointment",
      relatedAppointment: appointment._id,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error assigning appointment",
      error: error.message,
    });
  }
};
