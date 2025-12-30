const express = require('express');
const router = express.Router();
const {
  geocodeAddress,
  reverseGeocode,
} = require('../controllers/geocodingController');

router.get('/geocode', geocodeAddress);
router.get('/reverse', reverseGeocode);

module.exports = router;