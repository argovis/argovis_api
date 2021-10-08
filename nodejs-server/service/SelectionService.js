'use strict';
const Profile = require('../models/profile');
const helper = require('../helpers/profileHelperFunctions')
const HELPER_CONST = require('../helpers/profileHelperConstants')

/**
 * Get a list of profile metadata for all profiles in a given time window.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * returns List
 **/
exports.selectionGlobalMapProfiles = function(startDate,endDate) {
  return new Promise(function(resolve, reject) {
    startDate = new Date(startDate)
    endDate = new Date(endDate)
    if ((endDate - startDate)/3600000 > 72){
      reject({"code": 400, "message": "Please request <= 72 hours of data at a time."});
      return;
    }

    const query = Profile.aggregate([
        {$match:  {date: {$lte: endDate, $gte: startDate}}},
        {$project: HELPER_CONST.MAP_META_AGGREGATE},
    ]);
    query.exec(function (err, meta) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        if(meta.length == 0){
          reject({"code": 404, "message": "Not found: No matching results found in database."});
          return;
        }
        resolve(meta);
    })
  });
}

