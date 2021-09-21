'use strict';
const tcTraj = require('../models/tcTraj');

/**
 * one tropical cyclone instance
 *
 * returns tcSchema
 **/
exports.findOneTC = function() {
  return new Promise(function(resolve, reject) {
    const query = tcTraj.findOne()
    query.exec(function (err, tcTraj) {
        if (err) reject({"code": 500, "message": "Server error"});
        if (tcTraj == null) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(tcTraj);
    })
  });
}
