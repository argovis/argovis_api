'use strict';


/**
 * Search and filter for an ocean heat content grid, https://doi.org/10.5281/ZENODO.6131625.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.findOHC = function(id,startDate,endDate,polygon,multipolygon,center,radius,compression,data) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : "metadata",
  "data" : [ "", "" ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
}, {
  "metadata" : "metadata",
  "data" : [ "", "" ],
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
 * OHC metadata search and filter.
 *
 * returns List
 **/
exports.findOHCmeta = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "timerange" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "data_type" : "data_type",
  "lonrange" : [ 6.027456183070403, 6.027456183070403 ],
  "latcell" : 5.637376656633329,
  "data_keys" : [ "data_keys", "data_keys" ],
  "loncell" : 5.962133916683182,
  "_id" : "_id",
  "units" : [ "units", "units" ],
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
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "levels" : [ 0.8008281904610115, 0.8008281904610115 ],
  "latrange" : [ 1.4658129805029452, 1.4658129805029452 ]
}, {
  "timerange" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "data_type" : "data_type",
  "lonrange" : [ 6.027456183070403, 6.027456183070403 ],
  "latcell" : 5.637376656633329,
  "data_keys" : [ "data_keys", "data_keys" ],
  "loncell" : 5.962133916683182,
  "_id" : "_id",
  "units" : [ "units", "units" ],
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
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "levels" : [ 0.8008281904610115, 0.8008281904610115 ],
  "latrange" : [ 1.4658129805029452, 1.4658129805029452 ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Search and filter for Roemmich-Gilson total (anomaly + mean) salinity grid
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findRGpaslTotal = function(id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : "metadata",
  "data" : [ "", "" ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
}, {
  "metadata" : "metadata",
  "data" : [ "", "" ],
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
 * Metadata for RG total salinity grid
 *
 * returns List
 **/
exports.findRGpsalTotalMeta = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "timerange" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "data_type" : "data_type",
  "lonrange" : [ 6.027456183070403, 6.027456183070403 ],
  "latcell" : 5.637376656633329,
  "data_keys" : [ "data_keys", "data_keys" ],
  "loncell" : 5.962133916683182,
  "_id" : "_id",
  "units" : [ "units", "units" ],
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
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "levels" : [ 0.8008281904610115, 0.8008281904610115 ],
  "latrange" : [ 1.4658129805029452, 1.4658129805029452 ]
}, {
  "timerange" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "data_type" : "data_type",
  "lonrange" : [ 6.027456183070403, 6.027456183070403 ],
  "latcell" : 5.637376656633329,
  "data_keys" : [ "data_keys", "data_keys" ],
  "loncell" : 5.962133916683182,
  "_id" : "_id",
  "units" : [ "units", "units" ],
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
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "levels" : [ 0.8008281904610115, 0.8008281904610115 ],
  "latrange" : [ 1.4658129805029452, 1.4658129805029452 ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Search and filter for Roemmich-Gilson total (anomaly + mean) temperature grid
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findRGtempTotal = function(id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : "metadata",
  "data" : [ "", "" ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
}, {
  "metadata" : "metadata",
  "data" : [ "", "" ],
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
 * Metadata for RG total temperature grid
 *
 * returns List
 **/
exports.findRGtempTotalMeta = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "timerange" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "data_type" : "data_type",
  "lonrange" : [ 6.027456183070403, 6.027456183070403 ],
  "latcell" : 5.637376656633329,
  "data_keys" : [ "data_keys", "data_keys" ],
  "loncell" : 5.962133916683182,
  "_id" : "_id",
  "units" : [ "units", "units" ],
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
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "levels" : [ 0.8008281904610115, 0.8008281904610115 ],
  "latrange" : [ 1.4658129805029452, 1.4658129805029452 ]
}, {
  "timerange" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "data_type" : "data_type",
  "lonrange" : [ 6.027456183070403, 6.027456183070403 ],
  "latcell" : 5.637376656633329,
  "data_keys" : [ "data_keys", "data_keys" ],
  "loncell" : 5.962133916683182,
  "_id" : "_id",
  "units" : [ "units", "units" ],
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
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "levels" : [ 0.8008281904610115, 0.8008281904610115 ],
  "latrange" : [ 1.4658129805029452, 1.4658129805029452 ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * List all possible values for certain grid query string parameters
 *
 * parameter String /grids query string parameter to summarize possible values of.
 * returns List
 **/
exports.gridVocab = function(parameter) {
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
 * gridded product selector
 *
 * gridName String name of the gridded product to query.
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * returns List
 **/
exports.gridselect = function(gridName,presRange,polygon,multipolygon,startDate,endDate) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "t" : "2000-01-23T04:56:07.000+00:00",
  "d" : [ 0.8008281904610115, 0.8008281904610115 ],
  "g" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "_id" : "_id"
}, {
  "t" : "2000-01-23T04:56:07.000+00:00",
  "d" : [ 0.8008281904610115, 0.8008281904610115 ],
  "g" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "_id" : "_id"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

