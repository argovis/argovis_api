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
    if (!GJV.valid(point) || !GJV.isPoint(point)){
        reject({"code": 400, "message": "Invalid lat/lon."});
        return;
    }

    const query = covar.findOne({forcastDays: forcastDays, geoLocation: {
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
 * Integral of probability distribution field over a region for a float starting at point lat-lon after forcastDays.
 *
 * lat BigDecimal latitude (degrees) of Argo float location
 * lon BigDecimal longitude (degrees) of Argo float location
 * forcastDays BigDecimal number of days over which to project Argo float drift
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * returns BigDecimal
 **/
exports.integralCovar = function(lat,lon,forcastDays,polygon) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = 0.8008281904610115;
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

