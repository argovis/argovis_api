'use strict';
const Profile = require('../models/profile')

/**
 * Summary data for all DACs in the database.
 *
 * returns List
 **/
exports.dacList = function() {
  return new Promise(function(resolve, reject) {
    const query = Profile.aggregate([
      {$sort: { 'date':-1}},
      {$group: {_id: '$dac',
               'number_of_profiles': {$sum:1},
               'most_recent_date': {$first: '$date'},
               'dac': {$first: '$dac'}
              }, 
      },
      {$sort: {'number_of_profiles':-1}},
    ]);
    query.exec(function (err, dacs) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(dacs.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(dacs);
    })
  });
}

