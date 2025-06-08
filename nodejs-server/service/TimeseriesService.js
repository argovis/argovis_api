'use strict';


/**
 * Search and filter for timeseries named in path
 *
 * timeseriesName String 
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String lon, lat pairs of the lower left and upper right corners of a box on a mercator projection, packed like [[lower left lon, lower left lat],[upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * verticalRange List Vertical range to filter for in pressure or depth as appropriate for this dataset; levels outside this range will not be returned. (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.findtimeseries = function(timeseriesName,id,startDate,endDate,polygon,box,center,radius,verticalRange,compression,data,batchmeta) {
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
 * Metadata for timeseries by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findtimeseriesMeta = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "data_info" : [ "", "" ],
  "timeseries" : [ "2010-01-01T00:00:00Z", "2010-01-01T00:00:00Z" ],
  "lattice" : {
    "minLon" : 5.637376656633329,
    "spacing" : [ 1.4658129805029452, 1.4658129805029452 ],
    "maxLat" : 2.3021358869347655,
    "minLat" : 5.962133916683182,
    "center" : [ 6.027456183070403, 6.027456183070403 ],
    "maxLon" : 7.061401241503109
  },
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
  "lattice" : {
    "minLon" : 5.637376656633329,
    "spacing" : [ 1.4658129805029452, 1.4658129805029452 ],
    "maxLat" : 2.3021358869347655,
    "minLat" : 5.962133916683182,
    "center" : [ 6.027456183070403, 6.027456183070403 ],
    "maxLon" : 7.061401241503109
  },
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


/**
 * List data and lattice for the requested timeseries.
 *
 * timeseriesName String 
 * parameter String categorical timeseries search and filter parameters
 * returns List
 **/
exports.timeseriesVocab = function(timeseriesName,parameter) {
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

