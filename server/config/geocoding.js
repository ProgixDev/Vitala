const NodeGeocoder = require("node-geocoder");

let geocoder;

function getGeocoder() {
  const apiKey = process.env.MAPBOX_ACCESS_TOKEN;
  if (!apiKey) {
    throw new Error(
      "MAPBOX_ACCESS_TOKEN is not set (required for Mapbox geocoding)",
    );
  }
  if (!geocoder) {
    geocoder = NodeGeocoder({
      provider: "mapbox",
      apiKey,
      formatter: null,
    });
  }
  return geocoder;
}

module.exports = {
  geocode: (...args) => getGeocoder().geocode(...args),
  reverse: (...args) => getGeocoder().reverse(...args),
};
