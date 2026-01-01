const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your phone number"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    userType: {
      type: String,
      enum: ["patient", "nurse", "admin"],
      default: "patient",
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended", "rejected"],
      default: "active",
    },
    profilePicture: {
      type: String,
      default: "",
    },

    // Patient-specific fields
    medicalProfile: {
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      dateOfBirth: Date,
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      allergies: [String],
      chronicIllnesses: [String],
      height: Number, // in cm
      weight: Number, // in kg
    },

    // Nurse-specific fields
    nurseProfile: {
      idDocuments: {
        front: String,
        back: String,
      },
      selfieVerification: String,
      licenseNumber: String,
      specializations: [String],
      experience: Number, // years
      availability: {
        monday: [{ start: String, end: String }],
        tuesday: [{ start: String, end: String }],
        wednesday: [{ start: String, end: String }],
        thursday: [{ start: String, end: String }],
        friday: [{ start: String, end: String }],
        saturday: [{ start: String, end: String }],
        sunday: [{ start: String, end: String }],
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      rejectionReason: String,
    },

    locations: [
      {
        label: String,
        address: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Settings
    settings: {
      notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        shareLocation: { type: Boolean, default: true },
      },
      preferences: {
        language: { type: String, default: "en" },
        darkMode: { type: Boolean, default: false },
        biometricAuth: { type: Boolean, default: false },
      },
    },

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Refresh token
    refreshToken: String,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Push notification token
    expoPushToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
