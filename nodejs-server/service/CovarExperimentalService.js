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

