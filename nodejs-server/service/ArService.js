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
    // argument sanitization performed by oa3 typechecking

    // perform DB query, error 500 if it fails or 404 if no results.
    const query = arShapes.find({date: date});
    query.exec(function (err, arShapes) {
        if (err) { 
          reject({"code": 500, "message": "Server error"});
          return;
        }
        if(arShapes.length == 0) {
          reject({"code": 404, "message": "Not found: No matching results found in database."});
          return;
        }
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
    if(!RegExp('^[0-9]+_[0-9]+$').test(String(_id))){
      reject({"code": 400, "message": "Bad request: Valid ID parameters match '^[0-9]+_[0-9]+$'."});
      return;
    }

    // perform DB query, error 500 if it fails or 404 if no results.
    const query = arShapes.find({_id: _id})
    query.exec(function (err, arShapes) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(arShapes.length == 0){
          reject({"code": 404, "message": "Not found: No matching results found in database."});
          return;
        }
        resolve(arShapes);
    })
  });
}

/**
 * one instance of a shape representing an atmospheric river
 *
 * returns arShapeSchema
 **/
exports.findOneAR = function() {
  return new Promise(function(resolve, reject) {
    // no parameters to sanitize

    // perform DB query, error 500 if it fails or 404 if no results.
    const query = arShapes.findOne()
    query.exec(function (err, arShapes) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        if (arShapes == null) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(arShapes);
    })
  });
}


