'use strict';
const arShapes = require('../models/arShapes');

/**
 * shapes representing atmospheric rivers at a given date-time
 *
 * date Date three hour increments starting at 2004-01-01T00:00:00 and ending at 2017-04-02T03:00:00
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


/**
 * shapes representing atmospheric rivers with a given ID
 *
 * _id String ID of an atmospheric river object
 * returns arShapeSchema
 **/
exports.findARbyID = function(_id) {
  return new Promise(function(resolve, reject) {

    // confirm arguments are reasonable, otherwise error 400.
    if(!RegExp('^[0-9]+_[0-9]+$').test(String(_id))) reject(400)

    // perform DB query, error 500 if it fails or 404 if no results.
    const query = arShapes.find({_id: _id})
    query.exec(function (err, arShapes) {
        if (err) reject(500);
        if(arShapes.length == 0) reject(404);
        resolve(arShapes);
    })
  });
}




