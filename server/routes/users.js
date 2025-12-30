const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateMedicalProfile,
  uploadProfilePicture,
  changePassword,
  addLocation,
  getLocations,
  deleteLocation,
  updateSettings,
  deleteAccount,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/medical-profile", updateMedicalProfile);
router.post(
  "/profile-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.put("/change-password", changePassword);

router.route("/locations").get(getLocations).post(addLocation);

router.delete("/locations/:locationId", deleteLocation);

router.delete("/account", deleteAccount);

router.put('/settings', updateSettings);

module.exports = router;
