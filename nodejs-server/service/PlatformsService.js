'use strict';
const Profile = require('../models/profile')
const helpers = require('./helpers')

/**
 * Lists all platforms that report BGC data.
 *
 * returns List
 **/
exports.bgcPlatformList = function() {
  return new Promise(function(resolve, reject) {
    const query = Profile.aggregate([
        {$match: {source: {$eq: "argo_bgc"}}}, 
        {$group: { _id: '$platform_wmo_number', platform_wmo_number: {$first: '$platform_wmo_number'}}}
    ])
    query.exec(function (err, platforms) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        if(platforms.length == 0){
          reject({"code": 404, "message": "Not found: No matching results found in database."});
          return;
        }
        resolve(Array.from(platforms, x => x.platform_wmo_number));
    })
    let postprocess = function(data) {
        return Array.from(data, x => x.platform_wmo_number)
    }
    query.exec(helpers.queryCallback.bind(null,postprocess, resolve, reject))
  });
}


/**
 * Provides a list of platforms (all by default) with their most recent known report and position.
 *
 * platforms List List of platform IDs (optional)
 * returns List
 **/
exports.platformList = function(platforms) {
  return new Promise(function(resolve, reject) {

    let aggPipeline = []

    // focus on a list of platforms, if provided
    if(platforms) {
      let pform = platforms.concat(platforms.map(x => Number(x))).filter(x => !Number.isNaN(x))
      aggPipeline.push({$match: {platform_wmo_number: { $in: pform}}})
    }

    // sort everyting remaining by date
    aggPipeline.push({$sort: { 'timestamp':-1}})

    // group by platform and find the latest for each
    aggPipeline.push({$group: { _id: '$platform_wmo_number',
                                platform_wmo_number: {$first: '$platform_wmo_number'},
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
      {$match: {platform_number: platform}},
      {$group:  { _id: '$platform_wmo_number',
                  platform_number: {$first: '$platform_wmo_number'},
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

