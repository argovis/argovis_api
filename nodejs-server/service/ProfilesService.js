'use strict';


/**
 * Search, reduce and download profile data.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from (optional)
 * radius BigDecimal km from centerpoint (optional)
 * id String Profile ID (optional)
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * dac String Data Assembly Center (optional)
 * source String  (optional)
 * woceline String  (optional)
 * datakey String  (optional)
 * compression String Data compression strategy (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profile = function(startDate,endDate,polygon,box,center,radius,id,platforms,presRange,dac,source,woceline,datakey,compression,data) {
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
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from (optional)
 * radius BigDecimal km from centerpoint (optional)
 * dac String Data Assembly Center (optional)
 * source String  (optional)
 * woceline String  (optional)
 * datakey String  (optional)
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profileList = function(startDate,endDate,polygon,box,center,radius,dac,source,woceline,datakey,platforms,presRange,data) {
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

