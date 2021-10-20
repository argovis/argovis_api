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
      {$sort: { 'date':-1}},
      {$group: {_id: '$dac',
               'number_of_profiles': {$sum:1},
               'most_recent_date': {$first: '$date'},
               'dac': {$first: '$dac'}
              }, 
      },
      {$sort: {'number_of_profiles':-1}},
    ]);
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}

