'use strict';
const Profile = require('../models/profile')

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
 * Provides a list of all platforms with some metadata.
 *
 * returns platformMeta
 **/
exports.platformMetaList = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "PI_NAME" : "PI_NAME",
  "most_recent_date" : "2000-01-23T04:56:07.000+00:00",
  "most_recent_date_added" : "2000-01-23T04:56:07.000+00:00",
  "dac" : "dac",
  "platform_number" : 6.027456183070403,
  "number_of_profiles" : 1,
  "POSITIONING_SYSTEM" : "POSITIONING_SYSTEM",
  "_id" : 0.8008281904610115
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

