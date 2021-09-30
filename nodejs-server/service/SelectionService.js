'use strict';


/**
 * Get a list of profile metadata for all profiles in a given time window.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period
 * endDate Date date-time formatted string indicating the end of a time period
 * returns List
 **/
exports.selectionGlobalMapProfiles = function(startDate,endDate) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 0,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "DIRECTION" : "DIRECTION",
  "isDeep" : true,
  "platform_number" : 6,
  "containsBGC" : true,
  "_id" : "_id"
}, {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 0,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "DIRECTION" : "DIRECTION",
  "isDeep" : true,
  "platform_number" : 6,
  "containsBGC" : true,
  "_id" : "_id"
} ];
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
exports.selectionOverview = function() {
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


/**
 * Get a list of profiles by ID, keeping only levels within a range of pressures.
 *
 * presRange List Pressure range
 * ids List List of profile IDs
 * returns List
 **/
exports.selectionProfileList = function(presRange,ids) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "date_qc" : 1,
  "euroargoPlatform" : "euroargoPlatform",
  "dac" : "dac",
  "lon" : 2.3021358869347655,
  "WMO_INST_TYPE" : "WMO_INST_TYPE",
  "station_parameters_in_nc" : [ "station_parameters_in_nc", "station_parameters_in_nc" ],
  "roundLat" : "roundLat",
  "strLon" : "strLon",
  "station_parameters" : [ "station_parameters", "station_parameters" ],
  "pres_min_for_PSAL" : 4.145608029883936,
  "PLATFORM_TYPE" : "PLATFORM_TYPE",
  "bgcMeas" : [ "{}", "{}" ],
  "date_formatted" : "2000-01-23",
  "isDeep" : true,
  "platform_number" : 7,
  "BASIN" : 7.386281948385884,
  "lat" : 5.637376656633329,
  "VERTICAL_SAMPLING_SCHEME" : "VERTICAL_SAMPLING_SCHEME",
  "pres_max_for_TEMP" : 9.301444243932576,
  "roundLon" : "roundLon",
  "bgcMeasKeys" : [ "bgcMeasKeys", "bgcMeasKeys" ],
  "position_qc" : 0,
  "DIRECTION" : "DIRECTION",
  "pres_max_for_PSAL" : 3.616076749251911,
  "POSITIONING_SYSTEM" : "POSITIONING_SYSTEM",
  "DATA_CENTRE" : "DATA_CENTRE",
  "coreMeas" : [ "{}", "{}" ],
  "url" : "url",
  "nc_url" : "nc_url",
  "PARAMETER_DATA_MODE" : [ "PARAMETER_DATA_MODE", "PARAMETER_DATA_MODE" ],
  "date_added" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 6,
  "PI_NAME" : "PI_NAME",
  "pres_min_for_TEMP" : 2.027123023002322,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "jcommopsPlatform" : "jcommopsPlatform",
  "core_data_mode" : "core_data_mode",
  "formatted_station_parameters" : [ "formatted_station_parameters", "formatted_station_parameters" ],
  "max_pres" : 5.962133916683182,
  "containsBGC" : true,
  "strLat" : "strLat",
  "_id" : "_id"
}, {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "date_qc" : 1,
  "euroargoPlatform" : "euroargoPlatform",
  "dac" : "dac",
  "lon" : 2.3021358869347655,
  "WMO_INST_TYPE" : "WMO_INST_TYPE",
  "station_parameters_in_nc" : [ "station_parameters_in_nc", "station_parameters_in_nc" ],
  "roundLat" : "roundLat",
  "strLon" : "strLon",
  "station_parameters" : [ "station_parameters", "station_parameters" ],
  "pres_min_for_PSAL" : 4.145608029883936,
  "PLATFORM_TYPE" : "PLATFORM_TYPE",
  "bgcMeas" : [ "{}", "{}" ],
  "date_formatted" : "2000-01-23",
  "isDeep" : true,
  "platform_number" : 7,
  "BASIN" : 7.386281948385884,
  "lat" : 5.637376656633329,
  "VERTICAL_SAMPLING_SCHEME" : "VERTICAL_SAMPLING_SCHEME",
  "pres_max_for_TEMP" : 9.301444243932576,
  "roundLon" : "roundLon",
  "bgcMeasKeys" : [ "bgcMeasKeys", "bgcMeasKeys" ],
  "position_qc" : 0,
  "DIRECTION" : "DIRECTION",
  "pres_max_for_PSAL" : 3.616076749251911,
  "POSITIONING_SYSTEM" : "POSITIONING_SYSTEM",
  "DATA_CENTRE" : "DATA_CENTRE",
  "coreMeas" : [ "{}", "{}" ],
  "url" : "url",
  "nc_url" : "nc_url",
  "PARAMETER_DATA_MODE" : [ "PARAMETER_DATA_MODE", "PARAMETER_DATA_MODE" ],
  "date_added" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 6,
  "PI_NAME" : "PI_NAME",
  "pres_min_for_TEMP" : 2.027123023002322,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "jcommopsPlatform" : "jcommopsPlatform",
  "core_data_mode" : "core_data_mode",
  "formatted_station_parameters" : [ "formatted_station_parameters", "formatted_station_parameters" ],
  "max_pres" : 5.962133916683182,
  "containsBGC" : true,
  "strLat" : "strLat",
  "_id" : "_id"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

