'use strict';


/**
 * Search, reduce and download profile data.
 *
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String box region of interest described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * id String Unique profile ID to search for. (optional)
 * platform String Unique platform ID to search for. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * dac String Data Assembly Center to search for. See /profiles/vocabulary?parameter=dac for list of options. (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /profiles/vocabulary?parameter=source for list of options. (optional)
 * woceline String WOCE line to search for. See /profiles/vocabulary?parameter=woceline for list of options. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. See /profiles/vocabulary?parameter=data for possible values. (optional)
 * returns List
 **/
exports.profile = function(startDate,endDate,polygon,box,center,radius,multipolygon,id,platform,presRange,dac,source,woceline,compression,data) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "country" : "country",
  "geolocation_argoqc" : 1.4658129805029452,
  "data" : [ [ 6.027456183070403, 6.027456183070403 ], [ 6.027456183070403, 6.027456183070403 ] ],
  "pi_name" : [ "pi_name", "pi_name" ],
  "instrument" : "instrument",
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "data_warning" : [ "data_warning", "data_warning" ],
  "platform_type" : "platform_type",
  "fleetmonitoring" : "fleetmonitoring",
  "timestamp" : "2000-01-23T04:56:07.000+00:00",
  "positioning_system" : "positioning_system",
  "data_keys_mode" : { },
  "data_center" : "data_center",
  "basin" : 0.8008281904610115,
  "vertical_sampling_scheme" : "vertical_sampling_scheme",
  "cycle_number" : 5.637376656633329,
  "wmo_inst_type" : "wmo_inst_type",
  "data_type" : "data_type",
  "platform_id" : "platform_id",
  "timestamp_argoqc" : 5.962133916683182,
  "data_keys" : [ "", "" ],
  "_id" : "_id",
  "profile_direction" : "profile_direction",
  "oceanops" : "oceanops",
  "source_info" : [ {
    "source" : [ "source", "source" ],
    "data_keys_source" : [ "data_keys_source", "data_keys_source" ],
    "source_url" : "source_url",
    "date_updated_source" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "source" : [ "source", "source" ],
    "data_keys_source" : [ "data_keys_source", "data_keys_source" ],
    "source_url" : "source_url",
    "date_updated_source" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "doi" : "doi",
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  }
}, {
  "country" : "country",
  "geolocation_argoqc" : 1.4658129805029452,
  "data" : [ [ 6.027456183070403, 6.027456183070403 ], [ 6.027456183070403, 6.027456183070403 ] ],
  "pi_name" : [ "pi_name", "pi_name" ],
  "instrument" : "instrument",
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "data_warning" : [ "data_warning", "data_warning" ],
  "platform_type" : "platform_type",
  "fleetmonitoring" : "fleetmonitoring",
  "timestamp" : "2000-01-23T04:56:07.000+00:00",
  "positioning_system" : "positioning_system",
  "data_keys_mode" : { },
  "data_center" : "data_center",
  "basin" : 0.8008281904610115,
  "vertical_sampling_scheme" : "vertical_sampling_scheme",
  "cycle_number" : 5.637376656633329,
  "wmo_inst_type" : "wmo_inst_type",
  "data_type" : "data_type",
  "platform_id" : "platform_id",
  "timestamp_argoqc" : 5.962133916683182,
  "data_keys" : [ "", "" ],
  "_id" : "_id",
  "profile_direction" : "profile_direction",
  "oceanops" : "oceanops",
  "source_info" : [ {
    "source" : [ "source", "source" ],
    "data_keys_source" : [ "data_keys_source", "data_keys_source" ],
    "source_url" : "source_url",
    "date_updated_source" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "source" : [ "source", "source" ],
    "data_keys_source" : [ "data_keys_source", "data_keys_source" ],
    "source_url" : "source_url",
    "date_updated_source" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "doi" : "doi",
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  }
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * List profile IDs that match a search
 *
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String box region of interest described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * dac String Data Assembly Center to search for. See /profiles/vocabulary?parameter=dac for list of options. (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /profiles/vocabulary?parameter=source for list of options. (optional)
 * woceline String WOCE line to search for. See /profiles/vocabulary?parameter=woceline for list of options. (optional)
 * platform String Unique platform ID to search for. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. See /profiles/vocabulary?parameter=data for possible values. (optional)
 * returns List
 **/
exports.profileList = function(startDate,endDate,polygon,box,center,radius,multipolygon,dac,source,woceline,platform,presRange,data) {
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
 * List all possible values for certain profile query string parameters
 *
 * parameter String /profiles query string parameter to summarize possible values of.
 * returns List
 **/
exports.profileVocab = function(parameter) {
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
 * Provides a summary of the profile database.
 *
 * returns profileCollectionSummary
 **/
exports.profilesOverview = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "numberBgc" : 1,
  "dacs" : [ "dacs", "dacs" ],
  "lastAdded" : "2000-01-23T04:56:07.000+00:00",
  "numberDeep" : 6,
  "numberOfProfiles" : 0
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

