'use strict';
const Profile = require('../models/profile');
const helper = require('../helpers/profileHelperFunctions')
const HELPER_CONST = require('../helpers/profileHelperConstants')

/**
 * Get a list of profiles by ID, keeping only levels within a range of pressures.
 *
 * presRange List Pressure range
 * ids List List of profile IDs
 * returns List
 **/
exports.selectionProfileList = function(presRange,ids) {
  return new Promise(function(resolve, reject) {

    let agg = [{$match: {_id: { $in: ids}}}]
    if (presRange){
        agg.push(helper.make_pres_project(presRange[0], presRange[1], 'measurements'))
    }
    agg.push({$match: {measurements: {$not: {$size: 0}}}})
    agg.push({$sort: { date: -1}})
    const query = Profile.aggregate(agg)
    query.exec(function (err, profs) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(profs.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(profs);
    })
  });
}

