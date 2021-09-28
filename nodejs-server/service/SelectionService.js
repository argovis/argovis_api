'use strict';
const Profile = require('../models/profile');
const helper = require('../helpers/profileHelperFunctions')
const HELPER_CONST = require('../helpers/profileHelperConstants')

/**
 * Get a list of profile metadata for all profiles in a given time window.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period
 * endDate Date date-time formatted string indicating the end of a time period
 * returns List
 **/
exports.selectionGlobalMapProfiles = function(startDate,endDate) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 0,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "DIRECTION" : "DIRECTION",
  "platform_number" : 6,
  "_id" : "_id"
}, {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 0,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "DIRECTION" : "DIRECTION",
  "platform_number" : 6,
  "_id" : "_id"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


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

