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
 * ids List List of profile IDs (optional)
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * dac String Data Assembly Center (optional)
 * compression String Data compression strategy (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profile = function(startDate,endDate,polygon,box,center,radius,ids,platforms,presRange,dac,compression,data) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "country" : "country",
  "geolocation_argoqc" : 6.027456183070403,
  "data" : [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ],
  "pi_name" : "pi_name",
  "instrument" : "instrument",
  "source" : [ "source", "source" ],
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "data_keys_source" : [ "data_keys_source", "data_keys_source" ],
  "source_url" : [ "source_url", "source_url" ],
  "platform_wmo_number" : 5.637376656633329,
  "platform_type" : "platform_type",
  "fleetmonitoring" : "fleetmonitoring",
  "timestamp" : "2000-01-23T04:56:07.000+00:00",
  "positioning_system" : "positioning_system",
  "data_keys_mode" : [ "data_keys_mode", "data_keys_mode" ],
  "data_center" : "data_center",
  "basin" : "basin",
  "date_updated_source" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "vertical_sampling_scheme" : "vertical_sampling_scheme",
  "cycle_number" : 5.962133916683182,
  "wmo_inst_type" : "wmo_inst_type",
  "data_type" : "data_type",
  "timestamp_argoqc" : 1.4658129805029452,
  "data_keys" : [ "", "" ],
  "_id" : "_id",
  "profile_direction" : "profile_direction",
  "oceanops" : "oceanops",
  "doi" : "doi",
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  }
}, {
  "country" : "country",
  "geolocation_argoqc" : 6.027456183070403,
  "data" : [ [ 0.8008281904610115, 0.8008281904610115 ], [ 0.8008281904610115, 0.8008281904610115 ] ],
  "pi_name" : "pi_name",
  "instrument" : "instrument",
  "source" : [ "source", "source" ],
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "data_keys_source" : [ "data_keys_source", "data_keys_source" ],
  "source_url" : [ "source_url", "source_url" ],
  "platform_wmo_number" : 5.637376656633329,
  "platform_type" : "platform_type",
  "fleetmonitoring" : "fleetmonitoring",
  "timestamp" : "2000-01-23T04:56:07.000+00:00",
  "positioning_system" : "positioning_system",
  "data_keys_mode" : [ "data_keys_mode", "data_keys_mode" ],
  "data_center" : "data_center",
  "basin" : "basin",
  "date_updated_source" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "vertical_sampling_scheme" : "vertical_sampling_scheme",
  "cycle_number" : 5.962133916683182,
  "wmo_inst_type" : "wmo_inst_type",
  "data_type" : "data_type",
  "timestamp_argoqc" : 1.4658129805029452,
  "data_keys" : [ "", "" ],
  "_id" : "_id",
  "profile_direction" : "profile_direction",
  "oceanops" : "oceanops",
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
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profileList = function(startDate,endDate,polygon,box,center,radius,dac,platforms,presRange,data) {
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

