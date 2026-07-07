const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken",
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, email } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Update medical profile
// @route   PUT /api/users/medical-profile
// @access  Private (Patient)
exports.updateMedicalProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.userType !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can update medical profile",
      });
    }

    user.medicalProfile = {
      ...user.medicalProfile,
      ...req.body,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Medical profile updated successfully",
      data: user.medicalProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating medical profile",
      error: error.message,
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    console.log("Uploading profile picture for user:", req.user._id);
    console.log("File details:", {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "vitala/profiles",
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
      ],
      public_id: `profile_${req.user._id}_${Date.now()}`,
    });

    console.log("Cloudinary upload successful:", result.secure_url);

    // Delete local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log("Local file deleted successfully");
    }

    // Update user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profilePicture = result.secure_url;
    await user.save();

    console.log("User profile picture updated in database");

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        url: result.secure_url,
      },
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);

    // Clean up local file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// @desc    Add user location
// @route   POST /api/users/locations
// @access  Private
const geocoder = require("../config/geocoding");

// @desc    Add user location
// @route   POST /api/users/locations
// @access  Private
exports.addLocation = async (req, res) => {
  try {
    const { label, address, coordinates, isDefault } = req.body;

    if (!address && !coordinates) {
      return res.status(400).json({
        success: false,
        message: "Either address or coordinates must be provided",
      });
    }

    const user = await User.findById(req.user._id);

    let finalCoordinates = coordinates;
    let finalAddress = address;

    // If coordinates not provided but address is, geocode the address
    if (!coordinates && address) {
      try {
        const geocodeResult = await geocoder.geocode(address);
        if (geocodeResult && geocodeResult.length > 0) {
          finalCoordinates = {
            latitude: parseFloat(geocodeResult[0].latitude),
            longitude: parseFloat(geocodeResult[0].longitude),
          };
          finalAddress = geocodeResult[0].formattedAddress || address;
        }
      } catch (geocodeError) {
        console.warn(
          "Geocoding failed, proceeding without coordinates:",
          geocodeError.message,
        );
      }
    }

    // If this is set as default, unset others
    if (isDefault) {
      user.locations.forEach((loc) => (loc.isDefault = false));
    }

    user.locations.push({
      label,
      address: finalAddress,
      coordinates: finalCoordinates,
      isDefault,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Location added successfully",
      data: user.locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding location",
      error: error.message,
    });
  }
};

// @desc    Get user locations
// @route   GET /api/users/locations
// @access  Private
exports.getLocations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user.locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching locations",
      error: error.message,
    });
  }
};

// @desc    Delete location
// @route   DELETE /api/users/locations/:locationId
// @access  Private
exports.deleteLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.locations = user.locations.filter(
      (loc) => loc._id.toString() !== req.params.locationId,
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting location",
      error: error.message,
    });
  }
};

// @desc    Update location
// @route   PUT /api/users/locations/:locationId
// @access  Private
exports.updateLocation = async (req, res) => {
  try {
    const { label, address, coordinates, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    const locationIndex = user.locations.findIndex(
      (loc) => loc._id.toString() === req.params.locationId,
    );

    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    // If this is set as default, unset others
    if (isDefault) {
      user.locations.forEach((loc) => (loc.isDefault = false));
    }

    // Update the location
    if (label !== undefined) user.locations[locationIndex].label = label;
    if (address !== undefined) user.locations[locationIndex].address = address;
    if (coordinates !== undefined)
      user.locations[locationIndex].coordinates = coordinates;
    if (isDefault !== undefined)
      user.locations[locationIndex].isDefault = isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: user.locations[locationIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating location",
      error: error.message,
    });
  }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");

    res.status(200).json({
      success: true,
      data: user.settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.settings = {
      ...user.settings,
      ...req.body,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: user.settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating settings",
      error: error.message,
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user's profile picture from cloudinary if exists
    if (user.profilePicture) {
      try {
        const publicId = user.profilePicture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`vitala/profiles/${publicId}`);
      } catch (error) {
        console.log("Error deleting profile picture:", error.message);
      }
    }

    // Delete the user
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return default settings if user doesn't have settings
    const defaultSettings = {
      notifications: {
        push: true,
        email: true,
        sms: false,
      },
      privacy: {
        shareLocation: true,
      },
      preferences: {
        biometricAuth: false,
        language: "en",
        darkMode: false,
      },
    };

    const settings = user.settings || defaultSettings;

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error in getSettings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {
        notifications: {
          push: true,
          email: true,
          sms: false,
        },
        privacy: {
          shareLocation: true,
        },
        preferences: {
          biometricAuth: false,
          language: "en",
          darkMode: false,
        },
      };
    }

    // Update settings recursively
    const updateNestedSettings = (target, source) => {
      for (const key in source) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          if (!target[key]) target[key] = {};
          updateNestedSettings(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    updateNestedSettings(user.settings, updates);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: user.settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating settings",
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
