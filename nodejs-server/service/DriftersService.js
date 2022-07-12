'use strict';
const Drifter = require('../models/drifter');
const helpers = require('./helpers');
const geojsonArea = require('@mapbox/geojson-area');

// const inflateDrifters = function(data){
//   // given an array of drifter data records,
//   // replace the data key in the data records with an object keyed by variable name.

//   let dk = ["ve", "vn", "err_lon", "err_lat", "err_ve", "err_vn", "gap", "sst", "sst1", "sst2", "err_sst", "err_sst1", "err_sst2", "flg_sst", "flg_sst1", "flg_sst2"]

//   for(let i=0; i<data.length; i++){
//     let d = {}
//     for(let j=0; j<data[i].data[0].length; j++){
//       d[dk[j]] = data[i].data[0][j]
//     }
//     data[i].data[0] = d
//   }

//   return data
// }

/**
 * Search, reduce and download drifter metadata.
 *
 * platform String Unique platform ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterMetaSearch = function(platform,wmo) {
  return new Promise(function(resolve, reject) {

    let match = {
        'WMO': wmo,
        'platform': platform
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = Drifter['drifterMetax'].aggregate([{$match:match}]);
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * Search, reduce and download drifter data.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * platform String Unique platform ID to search for. (optional)
 * compression String Data compression strategy to apply. (optional)
 * returns List
 **/
exports.drifterSearch = function(id,startDate,endDate,polygon,multipolygon,center,radius,wmo,platform,compression) {
  return new Promise(function(resolve, reject) {

    // input sanitization
    let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.startDate, params.endDate, params.polygon, null, params.center, params.radius, params.multipolygon, id||wmo||platform) 
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
        presRange: null
    }

    // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
    let metafilter = Promise.resolve(null)
    let metacomplete = false
    if(wmo||platform){
        let match = {
            'WMO': wmo,
            'platform': platform
        }
        Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

        metafilter = Drifter['drifterMetax'].aggregate([{$match: match}]).exec()
        metacomplete = true
    }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_match.bind(null, Drifter['drifterx'], params, local_filter))

    // if no metafilter search was performed, need to look up metadata for anything that matched datafilter
    let metalookup = Promise.resolve(null)
    if(!metacomplete){
        metalookup = datafilter.then(helpers.meta_lookup.bind(null, Drifter['drifterMetax']))
    }

    // send both metafilter and datafilter results to postprocessing:
    Promise.all([metafilter, datafilter, metalookup])
        .then(search_result => {return helpers.postprocess(pp_params, search_result)})
        .then(result => resolve(result))
        .catch(err => reject({"code": 500, "message": "Server error"}))
    
  });
}


/**
 * List all possible values for certain drifter query string parameters
 *
 * parameter String /drifters query string parameter to summarize possible values of.
 * returns List
 **/
exports.drifterVocab = function(parameter) {
  return new Promise(function(resolve, reject) {

    let lookup = {
        'wmo': 'WMO', // <parameter value> : <corresponding key in metadata document>
        'platform': 'platform'
    }

    Drifter['drifterMetax'].find().distinct(lookup[parameter], function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }
      resolve(vocab)
    })
  });
}

