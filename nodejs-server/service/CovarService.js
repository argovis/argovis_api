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

    var point = {"type": "Point", "coordinates": [lon,lat]};
    if (!GJV.valid(point) || !GJV.isPoint(point)) reject({"code": 400, "message": "Invalid lat/lon."});

    const query = covar.findOne({forcastDays: forcastDays, geoLocation: {
                                $near: {
                                    $geometry: point
                                    //$maxDistance: radius
                                }
                            }
                            });

    query.exec(function (err, covars) {
        if (err) reject({"code": 500, "message": "Server error"});
        if (covars == null) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(covars);
    })
  });
}

