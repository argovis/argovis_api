'use strict';


/**
 * Search, reduce and download drifter metadata.
 *
 * id String Unique drifter ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterMetaSearch = function(id,wmo) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "end_date" : "2000-01-23T04:56:07.000+00:00",
  "typebuoy" : "typebuoy",
  "end_lat" : 7.061401241503109,
  "deploy_lon" : 5.962133916683182,
  "drogue_lost_date" : "2000-01-23T04:56:07.000+00:00",
  "rowsize" : 0.8008281904610115,
  "units" : [ "units", "units" ],
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "typedeath" : 9.301444243932576,
  "long_name" : [ "long_name", "long_name" ],
  "deploy_date" : "2000-01-23T04:56:07.000+00:00",
  "deploy_lat" : 5.637376656633329,
  "WMO" : 6.027456183070403,
  "data_type" : "data_type",
  "expno" : 1.4658129805029452,
  "data_keys" : [ "data_keys", "data_keys" ],
  "_id" : "_id",
  "source_info" : [ {
    "source" : [ "source", "source" ],
    "source_url" : "source_url"
  }, {
    "source" : [ "source", "source" ],
    "source_url" : "source_url"
  } ],
  "end_lon" : 2.3021358869347655
}, {
  "end_date" : "2000-01-23T04:56:07.000+00:00",
  "typebuoy" : "typebuoy",
  "end_lat" : 7.061401241503109,
  "deploy_lon" : 5.962133916683182,
  "drogue_lost_date" : "2000-01-23T04:56:07.000+00:00",
  "rowsize" : 0.8008281904610115,
  "units" : [ "units", "units" ],
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "typedeath" : 9.301444243932576,
  "long_name" : [ "long_name", "long_name" ],
  "deploy_date" : "2000-01-23T04:56:07.000+00:00",
  "deploy_lat" : 5.637376656633329,
  "WMO" : 6.027456183070403,
  "data_type" : "data_type",
  "expno" : 1.4658129805029452,
  "data_keys" : [ "data_keys", "data_keys" ],
  "_id" : "_id",
  "source_info" : [ {
    "source" : [ "source", "source" ],
    "source_url" : "source_url"
  }, {
    "source" : [ "source", "source" ],
    "source_url" : "source_url"
  } ],
  "end_lon" : 2.3021358869347655
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Search, reduce and download drifter data.
 *
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * id String Unique drifter ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterSearch = function(startDate,endDate,polygon,multipolygon,id,wmo) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : "metadata",
  "data" : [ [ 6.027456183070403, 6.027456183070403 ], [ 6.027456183070403, 6.027456183070403 ] ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
}, {
  "metadata" : "metadata",
  "data" : [ [ 6.027456183070403, 6.027456183070403 ], [ 6.027456183070403, 6.027456183070403 ] ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
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
 * List all possible values for certain drifter query string parameters
 *
 * parameter String /drifters query string parameter to summarize possible values of.
 * returns List
 **/
exports.drifterVocab = function(parameter) {
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

