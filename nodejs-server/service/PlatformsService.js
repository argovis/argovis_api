'use strict';
const Profile = require('../models/profile')

/**
 * Provides a summary of platforms.
 *
 * returns platformStub
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

