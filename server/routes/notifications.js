const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  sendNotification,
  updateNotificationPreferences,
  getDeliveryStatus,
  updatePushToken,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getNotifications);
router.post("/send", sendNotification);
router.put("/read-all", markAllAsRead);
router.delete("/clear-all", clearAllNotifications);
router.put("/preferences", updateNotificationPreferences);
router.put("/push-token", updatePushToken);
router.get("/:id/delivery-status", getDeliveryStatus);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
