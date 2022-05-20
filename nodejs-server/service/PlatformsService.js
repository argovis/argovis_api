'use strict';
const Profile = require('../models/profile')
const helpers = require('./helpers')
const Summary = require('../models/summary');

/**
 * Provides a list of all Argo platform IDs with BGC data.
 *
 * returns List
 **/
exports.platformBGC = function() {
  return new Promise(function(resolve, reject) {

    const query = Summary.find({"_id":"argo_bgc"})
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))

  });
}

/**
 * Provides a list of platforms with their most recent known report and position.
 *
 * platforms List List of platform IDs
 * returns List
 **/
exports.platformList = function(platforms) {
  return new Promise(function(resolve, reject) {

    let aggPipeline = []
    // focus on a list of platforms, if provided
    if(platforms) {
      let pform = platforms.concat(platforms.map(x => String(x)))
      aggPipeline.push({$match: {platform_id: { $in: pform}}})
    }

    // sort everyting remaining by date
    aggPipeline.push({$sort: { 'timestamp':-1}})

    // group by platform and find the latest for each
    aggPipeline.push({$group: { _id: '$platform_id',
                                platform_id: {$first: '$platform_id'},
                                most_recent_date: {$max: '$timestamp'},
                                number_of_profiles: {$sum: 1},
                                cycle_number: {$first: '$cycle_number'},
                                geolocation: {$first: '$geolocation'}, 
                                data_center: {$first: '$data_center'}
                              }
                    })

    const query = Profile.aggregate(aggPipeline)
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * Provides metadata for a specified platform.
 *
 * platform String platform ID
 * returns platformMeta
 **/
exports.platformMeta = function(platform) {
  return new Promise(function(resolve, reject) {
    const query = Profile.aggregate([
      {$match: {platform_id: platform}},
      {$group:  { _id: '$platform_id',
                  platform_id: {$first: '$platform_id'},
                  most_recent_date: {$max: '$timestamp'},
                  most_recent_date_added: {$max: '$date_updated_argovis'},
                  number_of_profiles: {$sum: 1},
                  positioning_system: {$first: '$positioning_system'},
                  pi_name: {$first: '$pi_name'},
                  data_center: {$first: '$data_center'}}
      }
    ])

    query.exec(function (err, platformMeta) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        if(platformMeta.length == 0){
          reject({"code": 404, "message": "Not found: No matching results found in database."});
          return;
        }
        resolve(platformMeta[0]);
    })
    let postprocess = function(data){
      return data[0]
    }
    query.exec(helpers.queryCallback.bind(null,postprocess, resolve, reject))
  });
}

