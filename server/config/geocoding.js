const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapbox",
  apiKey: process.env.MAPBOX_ACCESS_TOKEN,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
