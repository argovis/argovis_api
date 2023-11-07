'use strict';


/**
 * Vocab data for the named extended object.
 *
 * extendedName String 
 * returns List
 **/
exports.extendedVocab = function(extendedName) {
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
 * Search and filter for extended object named in path
 *
 * extendedName String 
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * winding String Enforce ccw winding for polygon and multipolygon (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data minification strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * returns List
 **/
exports.findExtended = function(extendedName,id,startDate,endDate,polygon,multipolygon,winding,center,radius,compression,mostrecent) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : [ "metadata", "metadata" ],
  "raster" : [ "", "" ],
  "flags" : [ "flags", "flags" ],
  "_id" : "_id",
  "basins" : [ 6, 6 ],
  "geolocation" : {
    "coordinates" : [ [ [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ], [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ] ], [ [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ], [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ] ] ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
}, {
  "metadata" : [ "metadata", "metadata" ],
  "raster" : [ "", "" ],
  "flags" : [ "flags", "flags" ],
  "_id" : "_id",
  "basins" : [ 6, 6 ],
  "geolocation" : {
    "coordinates" : [ [ [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ], [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ] ], [ [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ], [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ] ] ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Metadata for extended objects by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findextendedMeta = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "data_info" : [ "", "" ],
  "data_type" : "data_type",
  "_id" : "_id",
  "source" : [ {
    "date_updated" : "2000-01-23T04:56:07.000+00:00",
    "source" : [ "source", "source" ],
    "url" : "url",
    "doi" : "doi"
  }, {
    "date_updated" : "2000-01-23T04:56:07.000+00:00",
    "source" : [ "source", "source" ],
    "url" : "url",
    "doi" : "doi"
  } ],
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00"
}, {
  "data_info" : [ "", "" ],
  "data_type" : "data_type",
  "_id" : "_id",
  "source" : [ {
    "date_updated" : "2000-01-23T04:56:07.000+00:00",
    "source" : [ "source", "source" ],
    "url" : "url",
    "doi" : "doi"
  }, {
    "date_updated" : "2000-01-23T04:56:07.000+00:00",
    "source" : [ "source", "source" ],
    "url" : "url",
    "doi" : "doi"
  } ],
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

