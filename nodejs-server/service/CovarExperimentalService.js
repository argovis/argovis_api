'use strict';
const covar = require('../models/covar');
const GJV = require('geojson-validation');
const pointInPolygon = require('@turf/boolean-point-in-polygon').default;

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
    var point = {"type": "Point", "coordinates": [lon,lat]};
    if (!GJV.valid(point) || !GJV.isPoint(point)){
        reject({"code": 400, "message": "Invalid lat/lon."});
        return;
    }

    const query = covar.findOne({forcastDays: forcastDays, geolocation: {
                                $near: {
                                    $geometry: point
                                    //$maxDistance: radius
                                }
                            }
                            });

    query.exec(function (err, covars) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }

        if (covars == null){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        resolve(covars);
    })
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
    var point = {"type": "Point", "coordinates": [lon,lat]};
    if (!GJV.valid(point) || !GJV.isPoint(point)){
        reject({"code": 400, "message": "Invalid lat/lon."});
        return;
    }

    const query = covar.findOne({forcastDays: forcastDays, geolocation: {
                                $near: {
                                    $geometry: point
                                    //$maxDistance: radius
                                }
                            }
                            });

    query.exec(function (err, covars) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }
        if (covars == null){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }

        polygon = {
            "type": "Polygon",
            "coordinates": [JSON.parse(polygon)]
        }
        let p = covars.features.map(x => x.properties.Probability*(pointInPolygon(x.geometry, polygon) ? 1:0)).reduce((a, b) => a + b, 0)
        resolve({"sum":p});
    })
  });
}

