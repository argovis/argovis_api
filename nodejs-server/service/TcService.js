'use strict';


/**
 * returns a list of tropical cyclone names and years
 *
 * returns List
 **/
exports.findStormNameList = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ "", "" ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Tropical cyclone search and filter.
 *
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * name String name of tropical cyclone (optional)
 * year BigDecimal year of tropical cyclone (optional)
 * returns List
 **/
exports.findTC = function(startDate,endDate,name,year) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00",
    "geolocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    }
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00",
    "geolocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    }
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
}, {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00",
    "geolocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    }
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00",
    "geolocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    }
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

