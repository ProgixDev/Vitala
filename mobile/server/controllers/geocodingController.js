const geocoder = require("../config/geocoding");

// @desc    Geocode address to coordinates
// @route   GET /api/geocoding/geocode
// @access  Public
exports.geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    const result = await geocoder.geocode(address);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const { latitude, longitude, formattedAddress } = result[0];

    res.status(200).json({
      success: true,
      data: {
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        formattedAddress,
      },
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    res.status(500).json({
      success: false,
      message: "Error geocoding address",
      error: error.message,
    });
  }
};

// @desc    Reverse geocode coordinates to address
// @route   GET /api/geocoding/reverse
// @access  Public
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude values",
      });
    }

    const result = await geocoder.reverse({ lat: latitude, lon: longitude });

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found for these coordinates",
      });
    }

    const { formattedAddress } = result[0];

    res.status(200).json({
      success: true,
      data: {
        address: formattedAddress,
        coordinates: {
          latitude,
          longitude,
        },
      },
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    res.status(500).json({
      success: false,
      message: "Error reverse geocoding coordinates",
      error: error.message,
    });
  }
};
