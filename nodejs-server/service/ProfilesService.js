'use strict';
const Profile = require('../models/profile');
const helpers = require('./helpers')
const geojsonArea = require('@mapbox/geojson-area');
const maxgeosearch = 3000000000000 //maximum geo region allowed in square meters
/**
 * Search, reduce and download profile data.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from (optional)
 * radius BigDecimal km from centerpoint (optional)
 * multipolygon String array of polygon regions; will return points interior to all listed polygons (optional)
 * id String Profile ID (optional)
 * platform String Platform ID (optional)
 * presRange List Pressure range (optional)
 * dac String Data Assembly Center (optional)
 * source List  (optional)
 * woceline String  (optional)
 * compression String Data compression strategy (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profile = function(startDate,endDate,polygon,box,center,radius,multipolygon,id,platform,presRange,dac,source,woceline,compression,data) {
  return new Promise(function(resolve, reject) {

    // parse inputs
    if(startDate){
      startDate = new Date(startDate);
    }
    if(endDate){
      endDate = new Date(endDate);
    }

    if(polygon){
      polygon = helpers.polygon_sanitation(polygon)

      if(polygon.hasOwnProperty('code')){
        // error, return and bail out
        reject(polygon)
        return
      }
    }
    if(box){
      box = helpers.box_sanitation(box)

      if(box.hasOwnProperty('code')){
        // error, return and bail out
        reject(box)
        return
      }
    }
    if(multipolygon){
      try {
        multipolygon = JSON.parse(multipolygon);
      } catch (e) {
        reject({"code": 400, "message": "Multipolygon region wasn't proper JSON; format should be [[first polygon], [second polygon]], where each polygon is [lon,lat],[lon,lat],..."});
        return
      }
      multipolygon = multipolygon.map(function(x){return helpers.polygon_sanitation(JSON.stringify(x))})
      if(multipolygon.some(p => p.hasOwnProperty('code'))){
        multipolygon = multipolygon.filter(x=>x.hasOwnProperty('code'))
        reject(multipolygon[0])
        return
      } 
    }

    let bailout = helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform)
    if(bailout){
      //request looks huge, reject it
      reject(bailout)
      return
    }

    let aggPipeline = profile_candidate_agg_pipeline(startDate,endDate,polygon,box,center,radius,multipolygon,id,platform,dac,source,woceline)

    if(aggPipeline.hasOwnProperty('code')){
      reject(aggPipeline);
      return;
    }

    // project out data here if we definitely don't need it
    if(!data && !presRange){
      aggPipeline.push({$project: {data: 0}})
    }

    const query = Profile.aggregate(aggPipeline);

    query.exec(function (err, profiles) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      profiles = helpers.filter_data(profiles, data, presRange)

      // reinflate data by default
      if(data && !compression && !data.includes('metadata-only')){
        profiles = profiles.map(p => reinflate(p))
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
 * multipolygon String array of polygon regions; will return points interior to all listed polygons (optional)
 * dac String Data Assembly Center (optional)
 * source List  (optional)
 * woceline String  (optional)
 * platform String Platform ID (optional)
 * presRange List Pressure range (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profileList = function(startDate,endDate,polygon,box,center,radius,multipolygon,dac,source,woceline,platform,presRange,data) {
  return new Promise(function(resolve, reject) {

    // parse inputs
    if(startDate){
      startDate = new Date(startDate);
    }
    if(endDate){
      endDate = new Date(endDate);
    }

    if(polygon){
      polygon = helpers.polygon_sanitation(polygon)

      if(polygon.hasOwnProperty('code')){
        // error, return and bail out
        reject(polygon)
        return
      }
    }
    if(box){
      box = helpers.box_sanitation(box)

      if(box.hasOwnProperty('code')){
        // error, return and bail out
        reject(box)
        return
      }
    }
    if(multipolygon){
      try {
        multipolygon = JSON.parse(multipolygon);
      } catch (e) {
        reject({"code": 400, "message": "Multipolygon region wasn't proper JSON; format should be [[first polygon], [second polygon]], where each polygon is [lon,lat],[lon,lat],..."});
        return
      }
      multipolygon = multipolygon.map(function(x){return helpers.polygon_sanitation(JSON.stringify(x))})
      if(multipolygon.some(p => p.hasOwnProperty('code'))){
        multipolygon = multipolygon.filter(x=>x.hasOwnProperty('code'))
        reject(multipolygon[0])
        return
      } 
    }
    console.log(1000, startDate, endDate, polygon, data)
    let bailout = helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, null, platform)
    console.log(2000, bailout)
    if(bailout){
      //request looks huge, reject it
      reject(bailout)
      return
    }

    let aggPipeline = profile_candidate_agg_pipeline(startDate,endDate,polygon,box,center,radius,multipolygon,null,platform,dac,source,woceline)

    if(aggPipeline.hasOwnProperty('code')){
      reject(aggPipeline);
      return;
    }

    // project out data here if we definitely don't need it
    if(!data && !presRange){
      aggPipeline.push({$project: {data: 0}})
    }

    const query = Profile.aggregate(aggPipeline);

    query.exec(function (err, profiles) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }
      profiles = helpers.filter_data(profiles, data, presRange)

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
        Profile.distinct('data_center'),
        Profile.aggregate([
          {$match: {'source_info.source':'argo_deep' }},
          {$count: "ndeep"}
        ]),
        Profile.aggregate([ // currently really, really slow
          {$match: {'source_info.source':'argo_bgc' }},
          {$count: "nbgc"}
        ]),
        Profile.aggregate([{ $sort: { date_updated_argovis: -1 } }, {$project: {'date_updated_argovis': 1}}, { $limit : 1 }])
    ]).then( ([ numberOfProfiles, dacs, numberDeep, numberBgc, lastAdded ]) => {
        const date = lastAdded[0].date_added
        let overviewData = {'numberOfProfiles': numberOfProfiles, 'dacs': dacs, 'numberDeep': numberDeep[0]['ndeep'], 'numberBgc': numberBgc[0]['nbgc'], 'lastAdded': lastAdded[0]['date_updated_argovis']}
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

const reinflate = function(profile){
  // given a profile object with data minified as an array of arrays of floats,
  // reinflate the data key to it's more traditional list of dictionaries.

  let levelinflate = function(data_keys, level){
    let l = {}
    for(let i=0; i<level.length; i++){
      l[data_keys[i]] = level[i]
    }
    return l
  }

  let data = profile.data.map(level => levelinflate.bind(null, profile.data_keys)(level))
  profile.data = data

  return profile
}

const profile_candidate_agg_pipeline = function(startDate,endDate,polygon,box,center,radius,multipolygon,id,platform,dac,source,woceline){
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

    let spacetimeMatch = {}
    let metadataMatch = {}
    let aggPipeline = []

    if(center && radius) {
      // sanitation
      if(radius > 700){
        return {"code": 400, "message": "Please limit proximity searches to at most 700 km in radius"};
      }

      // $geoNear must be first in the aggregation pipeline
      aggPipeline.push({$geoNear: {key: 'geolocation', near: {type: "Point", coordinates: [center[0], center[1]]}, maxDistance: 1000*radius, distanceField: "distcalculated"}}) 
      aggPipeline.push({ $unset: "distcalculated" })
    }

    // construct a match on timestamp + geolocation early in pipeline to leverage spacetime index
    if (startDate && endDate){
      spacetimeMatch['timestamp'] = {$gte: startDate, $lte: endDate}
    } else if (startDate){
      spacetimeMatch['timestamp'] = {$gte: startDate}
    } else if (endDate){
      spacetimeMatch['timestamp'] = {$lte: endDate}
    }

    if(polygon) {
      if(geojsonArea.geometry(polygon) > maxgeosearch){
        return {"code": 400, "message": "Polygon region is too big; please ask for 3 M square km or less in a single request, or about 15 deg x 15 deg at the equator."}
      }

      spacetimeMatch['geolocation'] = {$geoWithin: {$geometry: polygon}}
    }

    if(box) {
      let polybox = {
        "type": "Polygon",
        "coordinates": [[[box[0][0], box[0][1]], [box[1][0], box[0][1]], [box[1][0], box[1][1]], [box[0][0], box[1][1]], [box[0][0], box[0][1]]]]
      }
      if(geojsonArea.geometry(polybox) > maxgeosearch){
        return {"code": 400, "message": "Box region is too big; please ask for 3 M square km or less in a single request, or about 15 deg x 15 deg at the equator."}
      }

      spacetimeMatch['geolocation'] = {$geoWithin: {$box: box}}
    }

    if(multipolygon){

      if(multipolygon.every(p => geojsonArea.geometry(p) > maxgeosearch)){
        return {"code": 400, "message": "All Multipolygon regions are too big; at least one of them must be 3 M square km or less, or about 15 deg x 15 deg at the equator."}
      }
      multipolygon.sort((a,b)=>{geojsonArea.geometry(a) - geojsonArea.geometry(b)}) // smallest first to minimize size of unindexed geo search
      spacetimeMatch['geolocation'] = {$geoWithin: {$geometry: multipolygon[0]}}
    }

    aggPipeline.push({$match: spacetimeMatch})
    // zoom in on subsequent polygon regions; will be unindexed.
    if(multipolygon && multipolygon.length > 1){
      for(let i=1; i<multipolygon.length; i++){
        aggPipeline.push( {$match: {"geolocation": {$geoWithin: {$geometry: multipolygon[i]}}}} )
      }
    }

    if(id){
      metadataMatch['_id'] = id
    }

    if(platform){
      metadataMatch['platform_id'] = String(platform)
    }


    if(dac){
      metadataMatch['data_center'] = dac
    }

    if(source){
      let matches = source.filter(e => e.charAt(0)!='~')
      let negations = source.filter(e => e.charAt(0)=='~').map(x => x.substring(1))

      if(matches.length > 0 && negations.length > 0){
        metadataMatch['source_info.source'] = {'$all': matches, '$nin': negations}
      } else if (matches.length > 0){
        metadataMatch['source_info.source'] = {'$all': matches}
      } else if (negations.length > 0){
        metadataMatch['source_info.source'] = {'$nin': negations}
      }
    }

    if(woceline){
      metadataMatch['woce_lines'] = woceline
    }

    aggPipeline.push({$match: metadataMatch})

    return aggPipeline
}
