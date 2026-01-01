const { Expo } = require('expo-server-sdk');
const sendEmail = require('../config/email');
const Notification = require('../models/Notification');

// Create a new Expo SDK client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

/**
 * Send push notification via Expo
 * @param {Object} options - Notification options
 * @param {string} options.expoPushToken - Expo push token
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} options.data - Additional data
 * @param {string} options.sound - Sound to play (default: 'default')
 * @param {string} options.priority - Priority level (default, normal, high)
 * @returns {Promise<Object>} Delivery status
 */
const sendPushNotification = async ({
  expoPushToken,
  title,
  body,
  data = {},
  sound = 'default',
  priority = 'default',
}) => {
  const deliveryStatus = {
    sent: false,
    sentAt: null,
    delivered: false,
    error: null,
  };

  try {
    // Validate Expo push token
    if (!Expo.isExpoPushToken(expoPushToken)) {
      deliveryStatus.error = 'Invalid Expo push token';
      console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
      return deliveryStatus;
    }

    // Prepare the message
    const message = {
      to: expoPushToken,
      sound,
      title,
      body,
      data,
      priority,
    };

    // Send the notification
    const tickets = await expo.sendPushNotificationsAsync([message]);
    const ticket = tickets[0];

    deliveryStatus.sentAt = new Date();

    if (ticket.status === 'ok') {
      deliveryStatus.sent = true;
      deliveryStatus.delivered = true;
      console.log('Push notification sent successfully:', ticket.id);
    } else if (ticket.status === 'error') {
      deliveryStatus.sent = true;
      deliveryStatus.error = ticket.message || 'Unknown error';
      console.error('Error sending push notification:', ticket.message);
      
      if (ticket.details?.error) {
        deliveryStatus.error = `${ticket.message} - ${ticket.details.error}`;
      }
    }

    return deliveryStatus;
  } catch (error) {
    deliveryStatus.error = error.message;
    console.error('Failed to send push notification:', error);
    return deliveryStatus;
  }
};

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} Delivery status
 */
const sendEmailNotification = async ({ to, subject, text, html }) => {
  const deliveryStatus = {
    sent: false,
    sentAt: null,
    delivered: false,
    error: null,
  };

  try {
    await sendEmail({
      to,
      subject,
      text,
      html,
    });

    deliveryStatus.sent = true;
    deliveryStatus.delivered = true;
    deliveryStatus.sentAt = new Date();
    console.log(`Email notification sent to ${to}`);
    return deliveryStatus;
  } catch (error) {
    deliveryStatus.sent = true;
    deliveryStatus.error = error.message;
    deliveryStatus.sentAt = new Date();
    console.error('Failed to send email notification:', error);
    return deliveryStatus;
  }
};

/**
 * Create and send notification to user
 * @param {Object} options - Notification options
 * @param {string} options.userId - User ID
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type
 * @param {string} options.priority - Priority level
 * @param {Object} options.data - Additional data
 * @param {Object} options.userPreferences - User notification preferences
 * @param {string} options.expoPushToken - User's Expo push token
 * @param {string} options.email - User's email
 * @returns {Promise<Object>} Created notification
 */
const createAndSendNotification = async ({
  userId,
  title,
  message,
  type,
  priority = 'medium',
  data = {},
  userPreferences = {},
  expoPushToken = null,
  email = null,
  relatedAppointment = null,
  relatedPayment = null,
}) => {
  try {
    // Create notification in database
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      priority,
      relatedAppointment,
      relatedPayment,
      metadata: data,
    });

    const deliveryStatus = {
      push: null,
      email: null,
    };

    // Send push notification if enabled and token exists
    if (userPreferences.push && expoPushToken) {
      deliveryStatus.push = await sendPushNotification({
        expoPushToken,
        title,
        body: message,
        data: {
          notificationId: notification._id.toString(),
          type,
          ...data,
        },
        priority: priority === 'urgent' ? 'high' : 'default',
      });
    }

    // Send email notification if enabled and email exists
    if (userPreferences.email && email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p style="color: #666; line-height: 1.6;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This is an automated notification from Vitala. 
            You can manage your notification preferences in the app settings.
          </p>
        </div>
      `;

      deliveryStatus.email = await sendEmailNotification({
        to: email,
        subject: title,
        text: message,
        html: emailHtml,
      });
    }

    // Update notification with delivery status
    notification.deliveryStatus = deliveryStatus;
    await notification.save();

    console.log(`Notification created and sent for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('Failed to create and send notification:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendEmailNotification,
  createAndSendNotification,
};
