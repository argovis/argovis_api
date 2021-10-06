'use strict';
const Profile = require('../models/profile')

/**
 * Lists all platforms that report BGC data.
 *
 * returns List
 **/
exports.bgcPlatformList = function() {
  return new Promise(function(resolve, reject) {
    const query = Profile.aggregate([
        {$match: {containsBGC: true}}, 
        {$group: { _id: '$platform_number', platform_number: {$first: '$platform_number'}}}
    ])
    query.exec(function (err, platforms) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(platforms.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(Array.from(platforms, x => x.platform_number));
    })
  });
}


/**
 * Provides a list of all platforms with their most recent known report and position.
 *
 * returns platformRecent
 **/
exports.platformList = function() {
  return new Promise(function(resolve, reject) {
    const query = Profile.aggregate([
      {$sort: { 'date':-1}},
      {$group: {_id: '$platform_number',
                platform_number: {$first: '$platform_number'},
                most_recent_date: {$max: '$date'},
                number_of_profiles: {$sum: 1},
                cycle_number: {$first: '$cycle_number'},
                geoLocation: {$first: '$geoLocation'}, 
                dac: {$first: '$dac'}
              }
      }
    ])

    query.exec(function (err, platformStubs) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(platformStubs.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(platformStubs);
    })
  });
}


/**
 * Provides metadata for a specified platform.
 *
 * platform BigDecimal platform ID
 * returns platformMeta
 **/
exports.platformMeta = function(platform) {
  return new Promise(function(resolve, reject) {
    const query = Profile.aggregate([
      {$match: {platform_number: platform}},
      {$group:  { _id: '$platform_number',
                  platform_number: {$first: '$platform_number'},
                  most_recent_date: {$max: '$date'},
                  most_recent_date_added: {$max: '$date_added'},
                  number_of_profiles: {$sum: 1},
                  POSITIONING_SYSTEM: {$first: '$POSITIONING_SYSTEM'},
                  PI_NAME: {$first: '$PI_NAME'},
                  dac: {$first: '$dac'}}
      }
    ])

    query.exec(function (err, platformMeta) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(platformMeta.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(platformMeta);
    })
  });
}

