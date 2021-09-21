'use strict';
const tcTraj = require('../models/tcTraj');

/**
 * one tropical cyclone instance
 *
 * returns tcSchema
 **/
exports.findOneTC = function() {
  return new Promise(function(resolve, reject) {
    const query = tcTraj.findOne()
    query.exec(function (err, tcTraj) {
        if (err) reject({"code": 500, "message": "Server error"});
        if (tcTraj == null) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(tcTraj);
    })
  });
}

/**
 * tropical cyclones at a given date-time
 *
 * date Date date-time formatted string
 * returns tcSchema
 **/
exports.findTCbyDate = function(date) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 2.3021358869347655,
    "geoLocation" : {
      "coordinates" : [ [ 6.027456183070403, 6.027456183070403 ], [ 6.027456183070403, 6.027456183070403 ] ],
      "type" : "type"
    },
    "season" : 7.061401241503109,
    "lon" : 5.962133916683182,
    "time" : 6.027456183070403,
    "class" : "class",
    "lat" : 1.4658129805029452,
    "wind" : 5.637376656633329,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "date" : "date",
    "pres" : 2.3021358869347655,
    "geoLocation" : {
      "coordinates" : [ [ 6.027456183070403, 6.027456183070403 ], [ 6.027456183070403, 6.027456183070403 ] ],
      "type" : "type"
    },
    "season" : 7.061401241503109,
    "lon" : 5.962133916683182,
    "time" : 6.027456183070403,
    "class" : "class",
    "lat" : 1.4658129805029452,
    "wind" : 5.637376656633329,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

