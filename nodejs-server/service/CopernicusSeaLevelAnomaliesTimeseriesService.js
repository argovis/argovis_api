'use strict';


/**
 * Copernicus SLA search and filter.
 *
 * id String Unique ID to search for. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * winding String Enforce ccw winding for polygon and multipolygon (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.findCopernicusSLA = function(id,polygon,multipolygon,winding,center,radius,mostrecent,compression,data) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : [ "metadata", "metadata" ],
  "data" : [ [ "", "" ], [ "", "" ] ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  }
}, {
  "metadata" : [ "metadata", "metadata" ],
  "data" : [ [ "", "" ], [ "", "" ] ],
  "_id" : "_id",
  "basin" : 0.8008281904610115,
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
 * Copernicus SLA metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findCopernicusSLAmeta = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "data_info" : [ "", "" ],
  "timeseries" : [ "2010-01-01T00:00:00Z", "2010-01-01T00:00:00Z" ],
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
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00"
}, {
  "data_info" : [ "", "" ],
  "timeseries" : [ "2010-01-01T00:00:00Z", "2010-01-01T00:00:00Z" ],
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
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

