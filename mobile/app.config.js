const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const base = require("./app.json");

const mapboxAccessToken =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  "";

module.exports = {
  expo: {
    ...base.expo,
    plugins: base.expo.plugins.map((plugin) => {
      if (Array.isArray(plugin) && plugin[0] === "@rnmapbox/maps") {
        return ["@rnmapbox/maps", { accessToken: mapboxAccessToken }];
      }
      return plugin;
    }),
    extra: {
      ...base.expo.extra,
      mapboxAccessToken,
    },
  },
};
