const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'appointment',
        'payment',
        'message',
        'emergency',
        'system',
        'promotion',
        'verification',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    
    // Related data
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    relatedPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    
    // Action button
    action: {
      type: String,
      url: String,
      label: String,
    },
    
    // Delivery status
    deliveryStatus: {
      push: {
        sent: Boolean,
        sentAt: Date,
        delivered: Boolean,
        error: String,
      },
      email: {
        sent: Boolean,
        sentAt: Date,
        delivered: Boolean,
        error: String,
      },
      sms: {
        sent: Boolean,
        sentAt: Date,
        delivered: Boolean,
        error: String,
      },
    },
    
    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
