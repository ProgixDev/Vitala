const express = require('express');
const router = express.Router();
const {
  registerPatient,
  registerNurse,
  login,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.post("/register/patient", registerPatient);
router.post(
  "/register/nurse",
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  registerNurse
);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendEmailVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
