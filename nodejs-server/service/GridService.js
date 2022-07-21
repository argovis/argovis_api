'use strict';


/**
 * Search and filter for grid named in path
 *
 * gridName String 
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
exports.findgrid = function(gridName,id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : "metadata",
  "data" : [ "", "" ],
  "data_keys" : [ "data_keys", "data_keys" ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
  "units" : "",
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "timestamp" : "2000-01-23T04:56:07.000+00:00"
}, {
  "metadata" : "metadata",
  "data" : [ "", "" ],
  "data_keys" : [ "data_keys", "data_keys" ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
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
 * Metadata for grids by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findgridMeta = function(id) {
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

