'use strict';


/**
 * Probability distribution field for a float at point lat-lon after forcastDays.
 *
 * lat BigDecimal latitude (degrees) of Argo float location
 * lon BigDecimal longitude (degrees) of Argo float location
 * forcastDays BigDecimal number of days over which to project Argo float drift
 * returns CovarSchema
 **/
exports.findCovar = function(lat,lon,forcastDays) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "features" : [ {
    "geometry" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "type" : "type",
    "properties" : { }
  }, {
    "geometry" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "type" : "type",
    "properties" : { }
  } ],
  "dLat" : 6.027456183070403,
  "dLong" : 1.4658129805029452,
  "_id" : "_id",
  "forcastDays" : 5
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Covariance metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findCovarMeta = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "data_type" : "data_type",
  "data_keys" : [ "90", "90" ],
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
  "units" : "",
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "levels" : [ 0.8008281904610115, 0.8008281904610115 ]
}, {
  "data_type" : "data_type",
  "data_keys" : [ "90", "90" ],
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
  "units" : "",
  "date_updated_argovis" : "2000-01-23T04:56:07.000+00:00",
  "levels" : [ 0.8008281904610115, 0.8008281904610115 ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Probabilities of floats moving between two points in a range of forecast projections
 *
 * id String Unique ID to search for. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * forecastGeolocation List Longitude,latitude of forecast location. (optional)
 * metadata String metadata pointer (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Forecast durations to include. Return only documents that have all data requested. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.findTC = function(id,polygon,multipolygon,center,radius,forecastGeolocation,metadata,compression,data) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "metadata" : "",
  "data" : "",
  "_id" : "_id",
  "geolocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  }
}, {
  "metadata" : "",
  "data" : "",
  "_id" : "_id",
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
 * Sum of probability distribution field over a region for a float starting at point lat-lon after forcastDays.
 *
 * lat BigDecimal latitude (degrees) of Argo float location
 * lon BigDecimal longitude (degrees) of Argo float location
 * forcastDays BigDecimal number of days over which to project Argo float drift
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * returns inline_response_200
 **/
exports.sumCovar = function(lat,lon,forcastDays,polygon) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "sum" : 0
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

