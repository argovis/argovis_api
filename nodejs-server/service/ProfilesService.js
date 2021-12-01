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
 * param String Data Assembly Center (optional)
 * coreMeasurements List Keys of core measurements to include (optional)
 * bgcMeasurements List Keys of BGC measurements to include (optional)
 * returns List
 **/
exports.profile = function(startDate,endDate,polygon,box,center,radius,ids,platforms,presRange,param,coreMeasurements,bgcMeasurements) {
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
  "pres_min_for_PSAL" : 2.027123023002322,
  "PLATFORM_TYPE" : "PLATFORM_TYPE",
  "bgcMeas" : [ "", "" ],
  "date_formatted" : "2000-01-23",
  "isDeep" : true,
  "platform_number" : "",
  "BASIN" : 4.145608029883936,
  "lat" : 5.637376656633329,
  "VERTICAL_SAMPLING_SCHEME" : "VERTICAL_SAMPLING_SCHEME",
  "pres_max_for_TEMP" : 7.061401241503109,
  "measurements" : [ {
    "temp" : 1.2315135367772556,
    "pres" : 7.386281948385884,
    "psal" : 1.0246457001441578
  }, {
    "temp" : 1.2315135367772556,
    "pres" : 7.386281948385884,
    "psal" : 1.0246457001441578
  } ],
  "roundLon" : "roundLon",
  "bgcMeasKeys" : [ "bgcMeasKeys", "bgcMeasKeys" ],
  "position_qc" : 0,
  "DIRECTION" : "DIRECTION",
  "pres_max_for_PSAL" : 9.301444243932576,
  "POSITIONING_SYSTEM" : "POSITIONING_SYSTEM",
  "DATA_CENTRE" : "DATA_CENTRE",
  "url" : "url",
  "nc_url" : "nc_url",
  "PARAMETER_DATA_MODE" : [ "PARAMETER_DATA_MODE", "PARAMETER_DATA_MODE" ],
  "date_added" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 6,
  "PI_NAME" : "PI_NAME",
  "pres_min_for_TEMP" : 3.616076749251911,
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
  "pres_min_for_PSAL" : 2.027123023002322,
  "PLATFORM_TYPE" : "PLATFORM_TYPE",
  "bgcMeas" : [ "", "" ],
  "date_formatted" : "2000-01-23",
  "isDeep" : true,
  "platform_number" : "",
  "BASIN" : 4.145608029883936,
  "lat" : 5.637376656633329,
  "VERTICAL_SAMPLING_SCHEME" : "VERTICAL_SAMPLING_SCHEME",
  "pres_max_for_TEMP" : 7.061401241503109,
  "measurements" : [ {
    "temp" : 1.2315135367772556,
    "pres" : 7.386281948385884,
    "psal" : 1.0246457001441578
  }, {
    "temp" : 1.2315135367772556,
    "pres" : 7.386281948385884,
    "psal" : 1.0246457001441578
  } ],
  "roundLon" : "roundLon",
  "bgcMeasKeys" : [ "bgcMeasKeys", "bgcMeasKeys" ],
  "position_qc" : 0,
  "DIRECTION" : "DIRECTION",
  "pres_max_for_PSAL" : 9.301444243932576,
  "POSITIONING_SYSTEM" : "POSITIONING_SYSTEM",
  "DATA_CENTRE" : "DATA_CENTRE",
  "url" : "url",
  "nc_url" : "nc_url",
  "PARAMETER_DATA_MODE" : [ "PARAMETER_DATA_MODE", "PARAMETER_DATA_MODE" ],
  "date_added" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 6,
  "PI_NAME" : "PI_NAME",
  "pres_min_for_TEMP" : 3.616076749251911,
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


/**
 * List profile IDs that match a search
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from (optional)
 * radius BigDecimal km from centerpoint (optional)
 * param String Data Assembly Center (optional)
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * coreMeasurements List Keys of core measurements to include (optional)
 * bgcMeasurements List Keys of BGC measurements to include (optional)
 * returns List
 **/
exports.profileList = function(startDate,endDate,polygon,box,center,radius,param,platforms,presRange,coreMeasurements,bgcMeasurements) {
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

