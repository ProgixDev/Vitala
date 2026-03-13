const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const base = require("./app.json");

const googleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ||
  process.env.GOOGLE_MAPS_ANDROID_API_KEY ||
  "";

module.exports = {
  expo: {
    ...base.expo,
    android: {
      ...base.expo.android,
      config: {
        ...(base.expo.android.config || {}),
        googleMaps: {
          apiKey: googleMapsApiKey || base.expo.android.config?.googleMaps?.apiKey,
        },
      },
    },
  },
};
