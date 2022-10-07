'use strict';


/**
 * List all possible values for certain CCHDO query string parameters
 *
 * parameter String GO-SHIP query string parameter to summarize possible values of.
 * returns List
 **/
exports.cchdoVocab = function(parameter) {
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
 * CCHDO search and filter.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * metadata String metadata pointer (optional)
 * woceline String WOCE line to search for. See /cchdo/vocabulary?parameter=woceline for list of options. (optional)
 * cchdo_cruise BigDecimal CCHDO cruise ID to search for. See /cchdo/vocabulary?parameter=cchdo_cruise for list of options. (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /<data route>/vocabulary?parameter=source for list of options. (optional)
 * compression String Data minification strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findCCHDO = function(id,startDate,endDate,polygon,multipolygon,center,radius,metadata,woceline,cchdo_cruise,source,compression,mostrecent,data,presRange) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "data_warning" : [ "degenerate_levels", "degenerate_levels" ],
  "cast" : 6.027456183070403,
  "metadata" : "metadata",
  "data" : [ "", "" ],
  "station" : "station",
  "data_keys" : [ "ammonium_btl", "ammonium_btl" ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
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
  "units" : "",
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
}, {
  "data_warning" : [ "degenerate_levels", "degenerate_levels" ],
  "cast" : 6.027456183070403,
  "metadata" : "metadata",
  "data" : [ "", "" ],
  "station" : "station",
  "data_keys" : [ "ammonium_btl", "ammonium_btl" ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
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
  "units" : "",
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
 * GO-SHIP metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * woceline String WOCE line to search for. See /cchdo/vocabulary?parameter=woceline for list of options. (optional)
 * cchdo_cruise BigDecimal CCHDO cruise ID to search for. See /cchdo/vocabulary?parameter=cchdo_cruise for list of options. (optional)
 * returns List
 **/
exports.findCCHDOmeta = function(id,woceline,cchdo_cruise) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "country" : "country",
  "expocode" : "expocode",
  "woce_lines" : [ "woce_lines", "woce_lines" ],
  "pi_name" : [ "pi_name", "pi_name" ],
  "cchdo_cruise_id" : 0.8008281904610115,
  "data_type" : "data_type",
  "data_center" : "data_center",
  "instrument" : "instrument",
  "_id" : "_id",
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00"
}, {
  "country" : "country",
  "expocode" : "expocode",
  "woce_lines" : [ "woce_lines", "woce_lines" ],
  "pi_name" : [ "pi_name", "pi_name" ],
  "cchdo_cruise_id" : 0.8008281904610115,
  "data_type" : "data_type",
  "data_center" : "data_center",
  "instrument" : "instrument",
  "_id" : "_id",
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

