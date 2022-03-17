'use strict';
const Profile = require('../models/profile')
const helpers = require('./helpers')

/**
 * Summary data for all DACs in the database.
 *
 * returns List
 **/
exports.dacList = function() {
  return new Promise(function(resolve, reject) {
    const query = Profile.aggregate([
      {$sort: { 'timestamp':-1}},
      {$group: {_id: '$data_center',
               'number_of_profiles': {$sum:1},
               'most_recent_date': {$first: '$timestamp'},
               'data_center': {$first: '$data_center'}
              }, 
      },
      {$sort: {'number_of_profiles':-1}},
    ]);
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}

