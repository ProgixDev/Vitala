const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateMedicalProfile,
  uploadProfilePicture,
  changePassword,
  addLocation,
  getLocations,
  updateLocation,
  deleteLocation,
  getSettings,
  updateSettings,
  deleteAccount,
  getUserById,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

// Settings routes - MUST be before /:id route to avoid matching "settings" as an ID
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/medical-profile", updateMedicalProfile);
router.post(
  "/profile-picture",
  upload.uploadProfilePicture.single("profilePicture"),
  uploadProfilePicture,
);
router.put("/change-password", changePassword);

router.route("/locations").get(getLocations).post(addLocation);

router.put("/locations/:locationId", updateLocation);

router.delete("/locations/:locationId", deleteLocation);

router.delete("/account", deleteAccount);

// Dynamic ID route - MUST be last to avoid catching other routes
router.get("/:id", getUserById);

module.exports = router;
