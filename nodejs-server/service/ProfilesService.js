'use strict';
const Profile = require('../models/profile');
const goship = require('../models/goship');
const argo = require('../models/argo');
const helpers = require('../helpers/helpers')
const geojsonArea = require('@mapbox/geojson-area');

/**
 * Argo search and filter.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * platform String Unique platform ID to search for. (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /profiles/vocabulary?parameter=source for list of options. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data argo_data_keys Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findArgo = function(id,startDate,endDate,polygon,multipolygon,center,radius,platform,source,compression,data,presRange) {
  return new Promise(function(resolve, reject) {
    // input sanitization
    let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.polygon, null, params.center, params.radius, params.multipolygon) 
    if(bailout){
      //request looks huge or malformed, reject it
      reject(bailout)
      return
    }

    // local filter: fields in data collection other than geolocation and timestamp 
    let local_filter = []
    if(id){
        local_filter = [{$match:{'_id':id}}]
    }

    // custom addition for argo: negatable, array-based source.source matching:
    if(source){
      let sourcematch = {}
      let smatches = source.filter(e => e.charAt(0)!='~')
      let snegations = source.filter(e => e.charAt(0)=='~').map(x => x.substring(1))
      if(smatches.length > 0 && snegations.length > 0){
        sourcematch['source.source'] = {'$all': smatches, '$nin': snegations}
      } else if (smatches.length > 0){
        sourcematch['source.source'] = {'$all': smatches}
      } else if (snegations.length > 0){
        sourcematch['source.source'] = {'$nin': snegations}
      }
      local_filter.push({$match: sourcematch})
    }

    // postprocessing parameters
    let pp_params = {
        compression: compression,
        data: data,
        presRange: presRange
    }

    // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
    let metafilter = Promise.resolve(null)
    let metacomplete = false
    if(platform){
        let match = {
            'platform': platform
        }

        metafilter = argo['argoMeta'].aggregate([{$match: match}]).exec()
        metacomplete = true
    }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_match.bind(null, argo['argo'], params, local_filter))

    // if no metafilter search was performed, need to look up metadata for anything that matched datafilter
    let metalookup = Promise.resolve(null)
    if(!metacomplete){
        metalookup = datafilter.then(helpers.meta_lookup.bind(null, argo['argoMeta']))
    }

    // send both metafilter and datafilter results to postprocessing:
    Promise.all([metafilter, datafilter, metalookup])
        .then(search_result => {return helpers.postprocess(pp_params, search_result)})
        .then(result => { if(result.hasOwnProperty('code')) reject(result); else resolve(result)})
        .catch(err => reject({"code": 500, "message": "Server error"}))
  });
}


/**
 * Argo metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * platform String Unique platform ID to search for. (optional)
 * returns List
 **/
exports.findArgometa = function(id,platform) {
  return new Promise(function(resolve, reject) {
    let match = {
        '_id': id,
        'platform': platform
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = argo['argoMeta'].aggregate([{$match:match}]);
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * GO-SHIP search and filter.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * woceline String WOCE line to search for. See /profiles/vocabulary?parameter=woceline for list of options. (optional)
 * cchdo_cruise BigDecimal CCHDO cruise ID to search for. See /profiles/vocabulary?parameter=cchdo_cruise for list of options. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findGoship = function(res, id,startDate,endDate,polygon,multipolygon,center,radius,woceline,cchdo_cruise,compression,data,presRange) {
  return new Promise(function(resolve, reject) {

    // input sanitization
    let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.polygon, null, params.center, params.radius, params.multipolygon) 
    if(bailout){
      //request looks huge or malformed, reject it
      reject(bailout)
      return
    }

    // local filter: fields in data collection other than geolocation and timestamp 
    let local_filter = []
    if(id){
        local_filter = [{$match:{'_id':id}}]
    }

    // postprocessing parameters
    let pp_params = {
        compression: compression,
        data: data,
        presRange: presRange
    }

    // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
    let metafilter = Promise.resolve([{_id: null}])
    let metacomplete = false
    if(woceline||cchdo_cruise){
        let match = {
            'woce_lines': woceline,
            'cchdo_cruise_id': cchdo_cruise
        }
        Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

        metafilter = goship['goshipMeta'].aggregate([{$match: match}]).exec()
        metacomplete = true
    }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, goship['goship'], params, local_filter))

    Promise.all([metafilter, datafilter])
        .then(search_result => {
          
          let postprocess = helpers.post_xform(goship['goshipMeta'], pp_params, search_result, res)
          
          resolve([search_result[1], postprocess])
          
        })
  });
}

/**
 * GO-SHIP metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * woceline String WOCE line to search for. See /profiles/vocabulary?parameter=woceline for list of options. (optional)
 * cchdo_cruise BigDecimal CCHDO cruise ID to search for. See /profiles/vocabulary?parameter=cchdo_cruise for list of options. (optional)
 * returns List
 **/
exports.findGoshipmeta = function(res, id,woceline,cchdo_cruise) {
  return new Promise(function(resolve, reject) {
    let match = {
        '_id': id,
        'woce_lines': woceline,
        'cchdo_cruise_id': cchdo_cruise
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = goship['goshipMeta'].aggregate([{$match:match}]);
    let postprocess = helpers.meta_xform(res)
    resolve([query.cursor(), postprocess])
  });
}

/**
 * List all possible values for certain tc query string parameters
 *
 * parameter String GO-SHIP query string parameter to summarize possible values of.
 * returns List
 **/
exports.goshipVocab = function(parameter) {
  return new Promise(function(resolve, reject) {
    let lookup = {
        'woceline': 'woce_lines', // <parameter value> : <corresponding key in metadata document>
        'cchdo_cruise': 'cchdo_cruise_id'
    }

    goship['goshipMeta'].find().distinct(lookup[parameter], function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }
      resolve(vocab)
    })
  });
}


/**
 * Search, reduce and download profile data.
 *
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String box region of interest described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * id String Unique profile ID to search for. (optional)
 * platform String Unique platform ID to search for. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * dac String Data Assembly Center to search for. See /profiles/vocabulary?parameter=dac for list of options. (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /profiles/vocabulary?parameter=source for list of options. (optional)
 * woceline String WOCE line to search for. See /profiles/vocabulary?parameter=woceline for list of options. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. See /profiles/vocabulary?parameter=data for possible values. (optional)
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

    let bailout = helpers.request_sanitation(polygon, box, center, radius, multipolygon)
    if(bailout){
      //request looks huge or malformed, reject it
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
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String box region of interest described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * dac String Data Assembly Center to search for. See /profiles/vocabulary?parameter=dac for list of options. (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /profiles/vocabulary?parameter=source for list of options. (optional)
 * woceline String WOCE line to search for. See /profiles/vocabulary?parameter=woceline for list of options. (optional)
 * platform String Unique platform ID to search for. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. See /profiles/vocabulary?parameter=data for possible values. (optional)
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

    let bailout = helpers.request_sanitation(polygon, box, center, radius, multipolygon)
    if(bailout){
      //request looks huge or malformed, reject it
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
 * List all possible values for certain profile query string parameters
 *
 * parameter String /profiles query string parameter to summarize possible values of.
 * returns List
 **/
exports.profileVocab = function(parameter) {
  return new Promise(function(resolve, reject) {

    let key = ''
    if(parameter == 'data') key = 'data_keys'
    else if(parameter == 'woceline') key = 'woce_lines'
    else if(parameter == 'dac') key = 'data_center'
    else if(parameter == 'source') key = 'source_info.source'

    Profile.find().distinct(key, function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      resolve(vocab)
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

    let spacetimeMatch = {}
    let metadataMatch = {}
    let aggPipeline = []

    if(center && radius) {
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
      spacetimeMatch['geolocation'] = {$geoWithin: {$geometry: polygon}}
    }

    if(box) {
      spacetimeMatch['geolocation'] = {$geoWithin: {$box: box}}
    }

    if(multipolygon){
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
    aggPipeline.push({$sort: {timestamp:-1}})

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
