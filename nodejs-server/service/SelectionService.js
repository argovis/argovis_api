'use strict';


/**
 * Get a list of profile metadata for all profiles in a given time window.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * returns List
 **/
exports.selectionGlobalMapProfiles = function(startDate,endDate) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 0,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "DIRECTION" : "DIRECTION",
  "isDeep" : true,
  "platform_number" : 6,
  "containsBGC" : true,
  "_id" : "_id"
}, {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 0,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "DIRECTION" : "DIRECTION",
  "isDeep" : true,
  "platform_number" : 6,
  "containsBGC" : true,
  "_id" : "_id"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

