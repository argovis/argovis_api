'use strict';
const covar = require('../models/covar');
const GJV = require('geojson-validation');

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
    // argument sanitization performed by oa3 typechecking

    point = {'type': 'Point', 'coordinates': [lat, lon]}
    GJV.valid(point)
    GJV.isPoint(point)

    // perform DB query, error 500 if it fails or 404 if no results.
    const query = covar.findOne({forcastDays: forcastDays, geoLocation: {
                                $near: {
                                    $geometry: point,
                                    //$maxDistance: radius
                                }
                            }
                            });
    query.exec(function (err, covars) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(covars.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(covars);
    })
  });
}

