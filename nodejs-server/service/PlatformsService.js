'use strict';


/**
 * Lists all platforms that report BGC data.
 *
 * returns List
 **/
exports.bgcPlatformList = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ 0.8008281904610115, 0.8008281904610115 ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Provides a list of all platforms with their most recent known report and position.
 *
 * returns List
 **/
exports.platformList = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "cycle_number" : 5,
  "most_recent_date" : "2000-01-23T04:56:07.000+00:00",
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "dac" : "dac",
  "platform_number" : 6.027456183070403,
  "number_of_profiles" : 1,
  "_id" : 0.8008281904610115
}, {
  "cycle_number" : 5,
  "most_recent_date" : "2000-01-23T04:56:07.000+00:00",
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "dac" : "dac",
  "platform_number" : 6.027456183070403,
  "number_of_profiles" : 1,
  "_id" : 0.8008281904610115
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Provides metadata for a specified platform.
 *
 * platform BigDecimal platform ID
 * returns platformMeta
 **/
exports.platformMeta = function(platform) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "PI_NAME" : "PI_NAME",
  "most_recent_date" : "2000-01-23T04:56:07.000+00:00",
  "most_recent_date_added" : "2000-01-23T04:56:07.000+00:00",
  "dac" : "dac",
  "platform_number" : 6.027456183070403,
  "number_of_profiles" : 1,
  "POSITIONING_SYSTEM" : "POSITIONING_SYSTEM",
  "_id" : 0.8008281904610115
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

