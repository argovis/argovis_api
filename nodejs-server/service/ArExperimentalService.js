'use strict';
const arShapes = require('../models/arShapes');
const helpers = require('../helpers/helpers');

/**
 * Find and filter atmo river shapes.
 *
 * date Date three hour increments starting at 2004-01-01T00:00:00 and ending at 2017-04-02T03:00:00 (optional)
 * _id String ID of an atmospheric river object (optional)
 * returns List
 **/
exports.findAR = function(date,_id) {
  return new Promise(function(resolve, reject) {
    if(date && _id){
      reject({"code": 400, "message": "Please filter by atmo river date OR ID, not both."});
      return;
    }

    let filter = {}
    if(date){
      filter = {date: date}
    } else if (_id){
      if(!RegExp('^[0-9]+_[0-9]+$').test(String(_id))){
        reject({"code": 400, "message": "Bad request: Valid ID parameters match '^[0-9]+_[0-9]+$'."});
        return;
      }
      filter = {_id: _id}
    }
    const query = arShapes.find(filter)
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}

