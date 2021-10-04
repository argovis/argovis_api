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
    startDate = new Date(startDate)
    endDate = new Date(endDate)
    if ((endDate - startDate)/3600000 > 72) reject({"code": 400, "message": "Please request <= 72 hours of data at a time."});

    const query = Profile.aggregate([
        {$match:  {date: {$lte: endDate, $gte: startDate}}},
        {$project: HELPER_CONST.MAP_META_AGGREGATE},
    ]);
    query.exec(function (err, meta) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(meta.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(meta);
    })
  });
}


/**
 * Provides a summary of the profile database.
 *
 * returns profileCollectionSummary
 **/
exports.selectionOverview = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
        Profile.estimatedDocumentCount({}),
        Profile.distinct('dac'),
        Profile.find({'isDeep':true}).countDocuments(),
        Profile.find({'containsBGC':true}).countDocuments(),
        Profile.aggregate([{ $sort: { date: -1 } }, {$project: {'date_added': 1}}, { $limit : 1 }])
    ]).then( ([ numberOfProfiles, dacs, numberDeep, numberBgc, lastAdded ]) => {
        const date = lastAdded[0].date_added
        let overviewData = {'numberOfProfiles': numberOfProfiles, 'dacs': dacs, 'numberDeep': numberDeep, 'numberBgc': numberBgc, 'lastAdded': lastAdded[0]['date_added']}
        resolve(overviewData);
    }).catch(error => {
        reject({"code": 500, "message": "Server error"});
    });

  });
}


/**
 * Get a list of profiles by ID, keeping only levels within a range of pressures.
 *
 * presRange List Pressure range (optional)
 * ids List List of profile IDs (optional)
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

