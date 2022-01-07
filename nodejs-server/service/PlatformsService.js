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
        {$match: {containsBGC: true}}, 
        {$group: { _id: '$platform_number', platform_number: {$first: '$platform_number'}}}
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
        resolve(Array.from(platforms, x => x.platform_number));
    })
    let postprocess = function(data) {
        return Array.from(data, x => x.platform_number)
    }
    query.exec(helpers.queryCallback.bind(null,postprocess, resolve, reject))
  });
}


/**
 * Provides a list of platforms (all by default) with their most recent known report and position. Can filter down to only those platforms with their latest profile within a polygon.
 *
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * platforms List List of platform IDs (optional)
 * returns List
 **/
exports.platformList = function(polygon,platforms) {
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

