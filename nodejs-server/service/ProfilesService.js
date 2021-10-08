'use strict';
const Profile = require('../models/profile');
const GJV = require('geojson-validation');

/**
 * Search, reduce and download profile data.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * ids List List of profile IDs (optional)
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * coreMeasurements List Keys of core measurements to include (optional)
 * bgcMeasurements List Keys of BGC measurements to include (optional)
 * returns List
 **/
exports.profile = function(startDate,endDate,polygon,box,ids,platforms,presRange,coreMeasurements,bgcMeasurements) {
  return new Promise(function(resolve, reject) {
    if(startDate) startDate = new Date(startDate);
    if(endDate) endDate = new Date(endDate);
    if (
      (!endDate || !startDate || (endDate - startDate)/3600000/24 > 90) &&
      (!ids || ids.length >100) &&
      (!platforms || platforms.length>1)) {

      reject({"code": 400, "message": "Please request <= 90 days of data at a time, OR a single platform, OR at most 100 profile IDs."});
      return; 
    } 

    let aggPipeline = []

    if (startDate){
      aggPipeline.push({$match:  {date: {$gte: startDate}}})
    }

    if(endDate){
      aggPipeline.push({$match:  {date: {$lte: endDate}}})
    }

    if (ids){
      aggPipeline.push({$match: {_id: { $in: ids}}})
    }

    if(platforms) {
      aggPipeline.push({$match: {platform_number: { $in: platforms}}})
    }

    if(polygon && box){
      reject({"code": 400, "message": "Please specify only one of polygon or box."});
      return;
    }
    if(polygon) {
      // sanitation
      try {
        polygon = JSON.parse(polygon);
      } catch (e) {
        reject({"code": 400, "message": "Polygon region wasn't proper JSON; format should be [[lon,lat],[lon,lat],...]"});
        return;
      }

      polygon = {
        "type": "Polygon",
        "coordinates": [polygon]
      }

      if(!GJV.valid(polygon)){
        reject({"code": 400, "message": "Polygon region wasn't proper geoJSON; format should be [[lon,lat],[lon,lat],...]"});
        return;
      }
      aggPipeline.push({$match: {geoLocation: {$geoWithin: {$geometry: polygon}}}})
    }

    if(box) {
      // sanitation
      try {
        box = JSON.parse(box);
      } catch (e) {
        reject({"code": 400, "message": "Box region wasn't proper JSON; format should be [[lower left lon,lower left lat],[upper right lon,upper right lat]]"});
        return;
      }
      if(box.length != 2 || 
         box[0].length != 2 || 
         box[1].length != 2 || 
         typeof box[0][0] != 'number' ||
         typeof box[0][1] != 'number' ||
         typeof box[1][0] != 'number' || 
         typeof box[1][1] != 'number') {
        reject({"code": 400, "message": "Box region wasn't specified correctly; format should be [[lower left lon,lower left lat],[upper right lon,upper right lat]]"});
        return;
      }

      aggPipeline.push({$match: {geoLocation: {$geoWithin: {$box: box}}}})
    }

    if(presRange) {
      aggPipeline.push(pressureWindow('measurements', presRange[0], presRange[1]))
      aggPipeline.push(pressureWindow('bgcMeas', presRange[0], presRange[1]))
    }

    if(coreMeasurements && !coreMeasurements.includes('all')) {
      if (!coreMeasurements.includes('pres')) coreMeasurements.push('pres')
      aggPipeline.push(reduce_meas(coreMeasurements, 'measurements'))
    } else if(!coreMeasurements){
      aggPipeline.push({$project: {measurements: 0}})
    }

    if(bgcMeasurements && !bgcMeasurements.includes('all')) {
      if (!bgcMeasurements.includes('pres')) bgcMeasurements.push('pres')
      aggPipeline.push(reduce_meas(bgcMeasurements, 'bgcMeas'))
    } else if(!bgcMeasurements){
      aggPipeline.push({$project: {bgcMeas: 0}})
    }

    const query = Profile.aggregate(aggPipeline);

    query.exec(function (err, profiles) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      if(coreMeasurements && !bgcMeasurements){
        // keep only profiles that have some requested core measurement
        profiles = profiles.filter(item => (item.measurements !== null && item.measurements.length!=0))
      }
      if(!coreMeasurements && bgcMeasurements){
        // keep only profiles that have some requested bgc measurement
        profiles = profiles.filter(item => (item.bgcMeas !== null && item.bgcMeas.length!=0))
      }
      if(coreMeasurements && bgcMeasurements){
        // keep only profiles that have at least one of a requested core or bgc measurement
        profiles = profiles.filter(item => ((item.measurements !== null && item.measurements.length!=0)) || (item.bgcMeas !== null && item.bgcMeas.length!=0))
      }

      if(profiles.length == 0) {
        reject({"code": 404, "message": "Not found: No matching results found in database."});
        return;
      }
      
      resolve(profiles);
    })
  }
)}

/**
 * Provides a summary of the profile database.
 *
 * returns profileCollectionSummary
 **/
exports.profilesOverview = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
        Profile.estimatedDocumentCount({}),
        Profile.distinct('dac'),
        Profile.find({'isDeep':true}).countDocuments(),
        Profile.find({'containsBGC':true}).countDocuments(),
        Profile.aggregate([{ $sort: { date: -1 } }, {$project: {'date_added': 1}}, { $limit : 1 }])
    ]).then( ([ numberOfProfiles, dacs, numberDeep, numberBgc, lastAdded ]) => {
        const date = lastAdded[0].date_added
        let overviewData = {'numberOfProfiles': numberOfProfiles, 'dacs': dacs, 'numberDeep': numberDeep, 'numberBgc': numberBgc, 'lastAdded': lastAdded[0]['date_added']}
        resolve(overviewData);
    }).catch(error => {
        reject({"code": 500, "message": "Server error"});
        return;
    });

  });
}

// helpers /////////////////////////////////////

const pressureWindow = function(measType, minPres, maxPres){
  // measType == 'measurements' or 'bgcMeas'

  const pWindow = {
    $addFields: {
      [measType]: {
        $filter: {
          input: "$".concat(measType),
          as: "m",
          cond: {$and: [
            {$gt: ['$$m.pres', minPres]},
            {$lt: ['$$m.pres', maxPres]}
          ]},
        }
      }
    }
  }

  return pWindow
}

const reduce_meas = function(keys, meas) {
  // meas == 'measurements' or 'bgcMeas'
  // keys == list of keys to keep from meas.
  let newObj = {}
  let idx = 0
  for (idx=0; idx<keys.length; idx++) {
      const key = keys[idx]
      const item = '$$item.'.concat(key)
      newObj[key] = item
      if(meas=='bgcMeas'){
        const item_qc = item.concat('_qc')
        newObj[key+'_qc'] = item_qc
      }
  }
  console.log(newObj)
  const reduceArray = {
                      $addFields: {
                          [meas]: {
                              $map: {
                                  input: "$".concat(meas),
                                  as: "item",
                                  in: newObj
                              }
                          }
                      }
                  }
  return reduceArray
}
