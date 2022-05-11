'use strict';


/**
 * gridded product selector
 *
 * gridName String name of the gridded product
 * presRange List Pressure range (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * multipolygon String array of polygon regions; will return points interior to all listed polygons (optional)
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
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

