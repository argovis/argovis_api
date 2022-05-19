'use strict';
const Profile = require('../models/profile');

/**
 * Provides summary data for each data assembly center.
 *
 * returns List
 **/
exports.dacSummary = function() {
  return new Promise(function(resolve, reject) {

    const sortMap = new Map();
    sortMap.set('data_center', 1)
    sortMap.set('timestamp', -1)

    let dacsummary = [
        {'$sort': sortMap}, 
        {'$group': {'_id': '$data_center','number_of_profiles': {'$sum':1}, 'most_recent_date':{'$first':'$timestamp'}}}  
    ]

    const query = Profile.aggregate(dacsummary)

    query.exec(function (err, dacs) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }
      resolve(dacs);
    })
  });
}


