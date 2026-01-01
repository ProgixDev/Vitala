const { Expo } = require('expo-server-sdk');
const sendEmail = require('../config/email');
const twilio = require("twilio");
const Notification = require("../models/Notification");

// Initialize Twilio client (only if credentials are properly configured)
let twilioClient = null;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

if (twilioAccountSid && twilioAuthToken && twilioAccountSid.startsWith("AC")) {
  try {
    twilioClient = new twilio(twilioAccountSid, twilioAuthToken);
    console.log("Twilio SMS service initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize Twilio client:", error.message);
  }
} else {
  console.warn(
    "Twilio credentials not configured. SMS notifications will be disabled."
  );
}

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
  sound = "default",
  priority = "default",
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
      deliveryStatus.error = "Invalid Expo push token";
      console.error(
        `Push token ${expoPushToken} is not a valid Expo push token`
      );
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

    if (ticket.status === "ok") {
      deliveryStatus.sent = true;
      deliveryStatus.delivered = true;
      console.log("Push notification sent successfully:", ticket.id);
    } else if (ticket.status === "error") {
      deliveryStatus.sent = true;
      deliveryStatus.error = ticket.message || "Unknown error";
      console.error("Error sending push notification:", ticket.message);

      if (ticket.details?.error) {
        deliveryStatus.error = `${ticket.message} - ${ticket.details.error}`;
      }
    }

    return deliveryStatus;
  } catch (error) {
    deliveryStatus.error = error.message;
    console.error("Failed to send push notification:", error);
    return deliveryStatus;
  }
};

/**
 * Send SMS notification via Twilio
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.message - SMS message
 * @returns {Promise<Object>} Delivery status
 */
const sendSMSNotification = async ({ to, message }) => {
  const deliveryStatus = {
    sent: false,
    sentAt: null,
    delivered: false,
    error: null,
  };

  // Check if Twilio is configured
  if (!twilioClient) {
    deliveryStatus.error = "Twilio SMS service not configured";
    console.warn("SMS notification skipped - Twilio not configured");
    return deliveryStatus;
  }

  try {
    // Format phone number (ensure it has country code)
    let formattedNumber = to;
    if (!formattedNumber.startsWith("+")) {
      // Assume US number if no country code
      formattedNumber = `+1${formattedNumber.replace(/\D/g, "")}`;
    }

    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });

    deliveryStatus.sent = true;
    deliveryStatus.sentAt = new Date();
    deliveryStatus.delivered = sms.status === "delivered";

    console.log(`SMS notification sent to ${formattedNumber}, SID: ${sms.sid}`);
    return deliveryStatus;
  } catch (error) {
    deliveryStatus.sent = false;
    deliveryStatus.error = error.message;
    console.error("Failed to send SMS notification:", error);
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
    deliveryStatus.sentAt = new Date();
    deliveryStatus.delivered = true; // Email delivery status is harder to track

    console.log(`Email notification sent to ${to}`);
    return deliveryStatus;
  } catch (error) {
    deliveryStatus.sent = false;
    deliveryStatus.error = error.message;
    console.error("Failed to send email notification:", error);
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
 * @param {string} options.phoneNumber - User's phone number
 * @returns {Promise<Object>} Created notification
 */
const createAndSendNotification = async ({
  userId,
  title,
  message,
  type,
  priority = "medium",
  data = {},
  userPreferences = {},
  expoPushToken = null,
  email = null,
  phoneNumber = null,
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
      sms: null,
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
        priority: priority === "urgent" ? "high" : "default",
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

    // Send SMS notification if enabled and phone number exists
    if (userPreferences.sms && phoneNumber) {
      deliveryStatus.sms = await sendSMSNotification({
        to: phoneNumber,
        message: `${title}: ${message}`,
      });
    }

    // Update notification with delivery status
    notification.deliveryStatus = deliveryStatus;
    await notification.save();

    console.log(`Notification created and sent for user ${userId}`);
    return notification;
  } catch (error) {
    console.error("Failed to create and send notification:", error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendEmailNotification,
  sendSMSNotification,
  createAndSendNotification,
};
