'use strict';


/**
 * List all possible values for certain Argo trajectory query string parameters
 *
 * parameter String Argo trajectory query string parameter to summarize possible values of.
 * returns List
 **/
exports.argotrajectoryVocab = function(parameter) {
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
 * Argo trajectory search and filter.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * winding String Enforce ccw winding for polygon and multipolygon (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * metadata String metadata pointer (optional)
 * platform String Unique platform ID to search for. (optional)
 * compression String Data minification strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * data argotrajectory_data_keys Keys of data to include. Return only documents that have all data requested. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.findArgoTrajectory = function(id,startDate,endDate,polygon,multipolygon,winding,center,radius,metadata,platform,compression,mostrecent,data) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : [ "metadata", "metadata" ],
  "data" : [ [ "", "" ], [ "", "" ] ],
  "timestamp_ascending" : "2000-01-23T04:56:07.000+00:00",
  "timestamp_descending" : "2000-01-23T04:56:07.000+00:00",
  "timestamp_midpoint_transmitted" : "2000-01-23T04:56:07.000+00:00",
  "timestamp_descending_transmitted" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 0.8008281904610115,
  "timestamp_ascending_transmitted" : "2000-01-23T04:56:07.000+00:00",
  "_id" : "_id",
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
}, {
  "metadata" : [ "metadata", "metadata" ],
  "data" : [ [ "", "" ], [ "", "" ] ],
  "timestamp_ascending" : "2000-01-23T04:56:07.000+00:00",
  "timestamp_descending" : "2000-01-23T04:56:07.000+00:00",
  "timestamp_midpoint_transmitted" : "2000-01-23T04:56:07.000+00:00",
  "timestamp_descending_transmitted" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 0.8008281904610115,
  "timestamp_ascending_transmitted" : "2000-01-23T04:56:07.000+00:00",
  "_id" : "_id",
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
 * Argo trajectory metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * platform String Unique platform ID to search for. (optional)
 * returns List
 **/
exports.findArgotrajectorymeta = function(id,platform) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "positioning_system" : "positioning_system",
  "data_info" : [ "", "" ],
  "sensor_type_flag" : 6.027456183070403,
  "mission_flag" : 1.4658129805029452,
  "platform_type" : "platform_type",
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
  "positioning_system_flag" : 0.8008281904610115,
  "extrapolation_flag" : 5.962133916683182,
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "platform" : "platform"
}, {
  "positioning_system" : "positioning_system",
  "data_info" : [ "", "" ],
  "sensor_type_flag" : 6.027456183070403,
  "mission_flag" : 1.4658129805029452,
  "platform_type" : "platform_type",
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
  "positioning_system_flag" : 0.8008281904610115,
  "extrapolation_flag" : 5.962133916683182,
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "platform" : "platform"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

