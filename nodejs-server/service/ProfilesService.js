'use strict';
const Profile = require('../models/profile');
const GJV = require('geojson-validation');
const helpers = require('./helpers')

/**
 * Search, reduce and download profile data.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from (optional)
 * radius BigDecimal km from centerpoint (optional)
 * ids List List of profile IDs (optional)
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * dac String Data Assembly Center (optional)
 * compression String Data compression strategy (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profile = function(startDate,endDate,polygon,box,center,radius,ids,platforms,presRange,dac,compression,data) {
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

    let aggPipeline = profile_candidate_agg_pipeline(startDate,endDate,polygon,box,center,radius,ids,platforms,dac)

    if('code' in aggPipeline){
      reject(aggPipeline);
      return;

    }

    // will need original measurement requests later, copy before mutating
    let origData = []
    if(data) {
      origData = JSON.parse(JSON.stringify(data))
    }

    // project out data for metadata-only requests
    if(!data){
      aggPipeline.push({$project: {data: 0}})
    }

    const query = Profile.aggregate(aggPipeline);

    query.exec(function (err, profiles) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      // for(let i=0; i<profiles.length; i++){
      //   if(profiles[i].measurements && Array.isArray(profiles[i].measurements[0]) ) profiles[i].measurements = profiles[i].measurements.map(m => helpers.arrayinflate(profiles[i].station_parameters, m))
      //   if(profiles[i].bgcMeas && Array.isArray(profiles[i].bgcMeas[0])) profiles[i].bgcMeas = profiles[i].bgcMeas.map(m => helpers.arrayinflate(profiles[i].bgcMeasKeys.concat(profiles[i].bgcMeasKeys.map(k=>k+'_qc')), m))
      // }

      if(data){
        // filter out measurements the user didn't request
        if(!data.includes('all')){
          profiles = profiles.map(x => reduce_data(x, data))
        }

        // filter out levels that fall outside the pressure range requested
        if(presRange){
          profiles = profiles.map(p => variable_bracket.bind(null, 'pressure', presRange[0], presRange[1])(p) )
        }

        // keep only profiles that have some requested data
        profiles = profiles.filter(item => ('data' in item && Array.isArray(item.data) && item.data.length > 0  ))
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
 * List profile IDs that match a search
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from (optional)
 * radius BigDecimal km from centerpoint (optional)
 * dac String Data Assembly Center (optional)
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profileList = function(startDate,endDate,polygon,box,center,radius,dac,platforms,presRange,data) {
  return new Promise(function(resolve, reject) {
    if(startDate) startDate = new Date(startDate);
    if(endDate) endDate = new Date(endDate);
    if (
      (!endDate || !startDate || (endDate - startDate)/3600000/24 > 90) &&
      (!platforms || platforms.length>1)) {

      reject({"code": 400, "message": "Please request <= 90 days of data at a time, OR a single platform."});
      return; 
    } 

    let aggPipeline = profile_candidate_agg_pipeline(startDate,endDate,polygon,box,center,radius,null,platforms,dac)

    if('code' in aggPipeline){
      reject(aggPipeline);
      return;
    }

    // project out data for metadata-only requests
    if(!data){
      aggPipeline.push({$project: {data: 0}})
    }

    const query = Profile.aggregate(aggPipeline);

    query.exec(function (err, profiles) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      if(data){
        // filter out measurements the user didn't request
        if(!data.includes('all')){
          profiles = profiles.map(x => reduce_data(x, data))
        }

        // filter out levels that fall outside the pressure range requested
        if(presRange){
          profiles = profiles.map(p => variable_bracket.bind(null, 'pressure', presRange[0], presRange[1])(p) )
        }

        // keep only profiles that have some requested data
        profiles = profiles.filter(item => ('data' in item && Array.isArray(item.data) && item.data.length > 0  ))
      }

      if(profiles.length == 0) {
        reject({"code": 404, "message": "Not found: No matching results found in database."});
        return;
      }

      resolve(Array.from(profiles, x => x._id))
    })
  });
}


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

const pressureWindow = function(measType, minPres, maxPres){ //todo no longer makes sense with current schema
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

const variable_bracket = function(key, min, max, profile){
  // given a profile, a data key and a min and max value,
  // filter out levels in the profile for which the value of the key variable falls outside the [min, max] range.

  column_idx = profile.data_keys.findIndex(elt => elt==key)
  profile.data = profile.data.filter(level => level[i] < max && level[i]>min)

  return profile
}

const reduce_meas = function(keys, meas) { // TODO retool this for current packing
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

const reduce_data = function(profile, keys){
  // profile == profile object returned from mongo
  // keys == list of keys to keep from profile.data
  // return the original profile, with p.data and p.data_keys mutated to suit the requested keys

  vars = helpers.zip(profile.data)
  keepers = profile.data_keys.map(x => keys.includes(x))
  data = []
  data_keys = []
  for(let i=0; i<keepers.length; i++){
    if(keepers[i]){
      data.push(vars[i])
      data_keys.push(profile.data_keys[i])
    }
  }
  profile.data_keys = data_keys
  profile.data = helpers.zip(data) 

  //filter out levels that have only pressure and qc
  value_columns = data_keys.map(key => !key.includes('pres') && !key.includes('_qc'))
  profile.data = profile.data.filter(level => level.filter((val, i) => value_columns[i]).some(e => !isNaN(e)))

  return profile
}

const profile_candidate_agg_pipeline = function(startDate,endDate,polygon,box,center,radius,ids,platforms,dac){
    // return an aggregation pipeline array that describes how we want to filter eligible profiles
    // in case of error, return the object to pass to reject().

    // sanity checks
    if((center && box) || (center && polygon) || (box && polygon)){
      reject({"code": 400, "message": "Please request only one of box, polygon or center."});
      return; 
    }

    if((center && !radius) || (!center && radius)){
      reject({"code": 400, "message": "Please specify both radius and center to filter for profiles less than <radius> km from <center>."});
      return; 
    }

    let aggPipeline = []

    if(center && radius) {
      // $geoNear must be first in the aggregation pipeline
      aggPipeline.push({$geoNear: { near: {type: "Point", coordinates: [center[0], center[1]]}, maxDistance: 1000*radius, distanceField: "distcalculated"}}) 
      aggPipeline.push({ $unset: "distcalculated" })
    }

    if (startDate){
      aggPipeline.push({$match:  {timestamp: {$gte: startDate}}})
    }

    if(endDate){
      aggPipeline.push({$match:  {timestamp: {$lte: endDate}}})
    }

    if (ids){
      aggPipeline.push({$match: {_id: { $in: ids}}})
    }

    if(platforms) {
      let pform = platforms.concat(platforms.map(x => Number(x))).filter(x => !Number.isNaN(x))
      aggPipeline.push({$match: {platform_wmo_number: { $in: pform}}})
    }

    if(polygon) {
      // sanitation
      try {
        polygon = JSON.parse(polygon);
      } catch (e) {
        return {"code": 400, "message": "Polygon region wasn't proper JSON; format should be [[lon,lat],[lon,lat],...]"};
      }

      if(!helpers.validlonlat(polygon)){
        return {"code": 400, "message": "All lon, lat pairs must respect -180<=lon<=180 and -90<=lat<-90"}; 
      }

      polygon = {
        "type": "Polygon",
        "coordinates": [polygon]
      }

      if(!GJV.valid(polygon)){
        return {"code": 400, "message": "Polygon region wasn't proper geoJSON; format should be [[lon,lat],[lon,lat],...]"};
      }

      aggPipeline.push({$match: {geolocation: {$geoWithin: {$geometry: polygon}}}})
    }

    if(box) {
      // sanitation
      try {
        box = JSON.parse(box);
      } catch (e) {
        return {"code": 400, "message": "Box region wasn't proper JSON; format should be [[lower left lon,lower left lat],[upper right lon,upper right lat]]"};
      }
      if(box.length != 2 || 
         box[0].length != 2 || 
         box[1].length != 2 || 
         typeof box[0][0] != 'number' ||
         typeof box[0][1] != 'number' ||
         typeof box[1][0] != 'number' || 
         typeof box[1][1] != 'number') {
        return {"code": 400, "message": "Box region wasn't specified correctly; format should be [[lower left lon,lower left lat],[upper right lon,upper right lat]]"};
      }

      if(!helpers.validlonlat(box)){
        return {"code": 400, "message": "All lon, lat pairs must respect -180<=lon<=180 and -90<=lat<-90"}; 
      }

      aggPipeline.push({$match: {geolocation: {$geoWithin: {$box: box}}}})
    }

    if(dac){
      aggPipeline.push({ $match : { data_center : dac } })
    }
    console.log(aggPipeline)

    return aggPipeline
}
