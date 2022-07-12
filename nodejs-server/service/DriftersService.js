'use strict';


/**
 * Search, reduce and download drifter metadata.
 *
 * platform String Unique platform ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterMetaSearch = function(platform,wmo) {
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
  "source" : [ {
    "source" : [ "source", "source" ],
    "url" : "url"
  }, {
    "source" : [ "source", "source" ],
    "url" : "url"
  } ],
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "platform" : "platform",
  "typedeath" : 9.301444243932576,
  "long_name" : [ "long_name", "long_name" ],
  "deploy_date" : "2000-01-23T04:56:07.000+00:00",
  "deploy_lat" : 5.637376656633329,
  "data_type" : "data_type",
  "WMO" : 6.027456183070403,
  "expno" : 1.4658129805029452,
  "data_keys" : [ "data_keys", "data_keys" ],
  "_id" : "_id",
  "end_lon" : 2.3021358869347655
}, {
  "end_date" : "2000-01-23T04:56:07.000+00:00",
  "typebuoy" : "typebuoy",
  "end_lat" : 7.061401241503109,
  "deploy_lon" : 5.962133916683182,
  "drogue_lost_date" : "2000-01-23T04:56:07.000+00:00",
  "rowsize" : 0.8008281904610115,
  "units" : [ "units", "units" ],
  "source" : [ {
    "source" : [ "source", "source" ],
    "url" : "url"
  }, {
    "source" : [ "source", "source" ],
    "url" : "url"
  } ],
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "platform" : "platform",
  "typedeath" : 9.301444243932576,
  "long_name" : [ "long_name", "long_name" ],
  "deploy_date" : "2000-01-23T04:56:07.000+00:00",
  "deploy_lat" : 5.637376656633329,
  "data_type" : "data_type",
  "WMO" : 6.027456183070403,
  "expno" : 1.4658129805029452,
  "data_keys" : [ "data_keys", "data_keys" ],
  "_id" : "_id",
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
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * platform String Unique platform ID to search for. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.drifterSearch = function(id,startDate,endDate,polygon,multipolygon,center,radius,wmo,platform,compression,data) {
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

