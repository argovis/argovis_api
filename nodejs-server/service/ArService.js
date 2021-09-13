'use strict';
const arShapes = require('../models/arShapes');

/**
 * shapes representing atmospheric rivers at a given date-time
 *
 * date Date three hour increments starting at 2004-01-01T00:00:00 and ending at 2017-04-02T03:00:00 (optional)
 * returns arShapeSchema
 **/
exports.findARbyDate = function(date) {
  return new Promise(function(resolve, reject) {
    const query = arShapes.find({date: date});
    query.exec(function (err, arShapes) {
        if (err) reject(err);
        resolve(arShapes);
    })
  });
}

