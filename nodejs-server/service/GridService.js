'use strict';


/**
 * gridded product selector
 *
 * gridName String name of the gridded product to query.
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * returns List
 **/
exports.gridselect = function(gridName,presRange,polygon,multipolygon,startDate,endDate) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "t" : "2000-01-23T04:56:07.000+00:00",
  "d" : [ 0.8008281904610115, 0.8008281904610115 ],
  "g" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "_id" : "_id"
}, {
  "t" : "2000-01-23T04:56:07.000+00:00",
  "d" : [ 0.8008281904610115, 0.8008281904610115 ],
  "g" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "_id" : "_id"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

