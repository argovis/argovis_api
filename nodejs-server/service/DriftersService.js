'use strict';
const Drifter = require('../models/drifter');

/**
 * Search, reduce and download drifter metadata.
 *
 * id String Unique drifter ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterMetaSearch = function(id,wmo) {
  return new Promise(function(resolve, reject) {

  });
}


/**
 * Search, reduce and download drifter data.
 *
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * id String Unique drifter ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterSearch = function(startDate,endDate,polygon,id,wmo) {
  return new Promise(function(resolve, reject) {

  });
}

