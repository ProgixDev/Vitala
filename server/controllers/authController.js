const User = require("../models/User");
const sendEmail = require("../config/email");
// Initialize Twilio only if credentials are properly configured
let twilio = null;
if (
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_ACCOUNT_SID.startsWith("AC")
) {
  twilio = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );
}
const {
  generateToken,
  generateRefreshToken,
  generateResetToken,
} = require("../utils/tokenUtils");

// @desc    Register patient
// @route   POST /api/auth/register/patient
// @access  Public
exports.registerPatient = async (req, res) => {
  try {
    console.log("Registration request body:", req.body);
    const { fullName, email, phoneNumber, password, medicalProfile } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate email verification code
    const emailVerificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Creating user with data:", {
      fullName,
      email,
      phoneNumber,
      userType: "patient",
      medicalProfile,
    });

    // Create user
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      userType: "patient",
      medicalProfile,
      emailVerificationToken: emailVerificationCode,
      emailVerificationExpires,
      isEmailVerified: false,
    });

    // Send email verification code
    try {
      console.log(
        `Sending verification email to ${email} with code ${emailVerificationCode}`,
      );
      await sendEmail({
        to: email,
        subject: "Verify Your Email - Vitala",
        html: `
          <h1>Welcome to Vitala!</h1>
          <p>Hi ${fullName},</p>
          <p>Thank you for registering with Vitala. Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #4461F2; letter-spacing: 4px;">${emailVerificationCode}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
      });
      console.log(`Verification email sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // For now, don't fail registration if email fails, but this should be fixed
      // TODO: Consider failing registration if email cannot be sent
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message:
        "Patient registered successfully. Please check your email to verify your account.",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
        },
        token,
        refreshToken,
        requiresEmailVerification: true,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering patient",
      error: error.message,
    });
  }
};

// @desc    Register nurse
// @route   POST /api/auth/register/nurse
// @access  Public
exports.registerNurse = async (req, res) => {
  try {
    console.log("Nurse registration request received");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const {
      fullName,
      email,
      phoneNumber,
      password,
      licenseNumber,
      specializations,
      experience,
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Get uploaded files
    const idFront = req.files?.idFront?.[0]?.path;
    const idBack = req.files?.idBack?.[0]?.path;
    const selfie = req.files?.selfie?.[0]?.path;

    if (!idFront || !idBack || !selfie) {
      return res.status(400).json({
        success: false,
        message: "Please upload ID documents (front, back) and selfie",
      });
    }

    // Parse specializations if it's a JSON string
    let parsedSpecializations = [];
    if (specializations) {
      try {
        parsedSpecializations =
          typeof specializations === "string"
            ? JSON.parse(specializations)
            : specializations;
      } catch (e) {
        parsedSpecializations = [];
      }
    }

    // Parse experience as a number
    const parsedExperience = experience ? parseInt(experience, 10) : 0;

    // Create user
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      userType: "nurse",
      status: "pending",
      nurseProfile: {
        idDocuments: {
          front: idFront,
          back: idBack,
        },
        selfieVerification: selfie,
        licenseNumber: licenseNumber || "",
        specializations: parsedSpecializations,
        experience: parsedExperience,
        verificationStatus: "pending",
      },
    });

    // Send email notification
    try {
      await sendEmail({
        to: email,
        subject: "Nurse Registration - Pending Verification",
        html: `
          <h1>Welcome to Vitala!</h1>
          <p>Hi ${fullName},</p>
          <p>Your nurse account has been registered successfully.</p>
          <p>Your account is currently pending verification. We'll notify you once it's approved.</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Nurse registered successfully. Account pending verification.",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
          status: user.status,
          verificationStatus: user.nurseProfile.verificationStatus,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering nurse",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log(
      `Login attempt for user: ${user.email}, isEmailVerified: ${user.isEmailVerified}`,
    );

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    console.log(`User ${user.email} isEmailVerified:`, user.isEmailVerified);
    if (!user.isEmailVerified) {
      console.log(`Blocking login for unverified user: ${user.email}`);
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        requiresEmailVerification: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
          },
        },
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
          status: user.status,
          profilePicture: user.profilePicture,
          verificationStatus: user.nurseProfile?.verificationStatus,
          isEmailVerified: user.isEmailVerified,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: code,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message,
    });
  }
};

// @desc    Resend email verification code
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification code
    const emailVerificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationToken = emailVerificationCode;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send email verification code
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Vitala",
        html: `
          <h1>Email Verification</h1>
          <p>Hi ${user.fullName},</p>
          <p>Your new verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #4461F2; letter-spacing: 4px;">${emailVerificationCode}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      res.status(200).json({
        success: true,
        message: "Verification code sent successfully",
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Error sending verification email",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resending verification code",
      error: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email",
      });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const crypto = require("crypto");
    const hashedCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    user.passwordResetToken = hashedCode;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email with code
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4461F2;">Password Reset Request</h1>
            <p>Hi ${user.fullName},</p>
            <p>You requested to reset your password. Use the code below to reset your password:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #4461F2; letter-spacing: 5px; margin: 0;">${resetCode}</h2>
            </div>
            <p>This code will expire in 30 minutes.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">This is an automated email from Vitala. Please do not reply.</p>
          </div>
        `,
      });

      res.status(200).json({
        success: true,
        message: "Password reset code sent to your email",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);

      // In development mode, still return success but log the reset code
      if (process.env.NODE_ENV === "development") {
        console.log("\n=== DEVELOPMENT MODE ===");
        console.log("Password Reset Code:", resetCode);
        console.log("Valid for 30 minutes");
        console.log("========================\n");

        return res.status(200).json({
          success: true,
          message:
            "Password reset code generated (check server console in dev mode)",
          // Only include code in development for testing
          ...(process.env.NODE_ENV === "development" && { resetCode }),
        });
      }

      // In production, clear the token and return error
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Error sending email. Please try again later.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing forgot password",
      error: error.message,
    });
  }
};

// @desc    Verify reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
      });
    }

    // Hash code to compare
    const crypto = require("crypto");
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetToken: hashedCode,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    res.status(200).json({
      success: true,
      message: "Code verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying code",
      error: error.message,
    });
  }
};

// @desc    Reset password with code
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, code, and new password are required",
      });
    }

    // Hash code
    const crypto = require("crypto");
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    // Find user
    const user = await User.findOne({
      email,
      passwordResetToken: hashedCode,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    // Set new password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Save new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
      error: error.message,
    });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        requiresEmailVerification: true,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};
