'use strict';
const tc = require('../models/tc');
const moment = require('moment');
const helpers = require('./helpers')

/**
 * Tropical cyclone search and filter.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * name String name of tropical cyclone (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. Possible values are 'wind', 'pres', 'all' and 'metadata-only'. (optional)
 * returns List
 **/
exports.findTC = function(id,startDate,endDate,polygon,multipolygon,center,radius,name,compression,data) {
  return new Promise(function(resolve, reject) {

    // input sanitization
    let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.startDate, params.endDate, params.polygon, null, params.center, params.radius, params.multipolygon, name||id) 
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
    if(name){
        metafilter = tc['tcMeta'].aggregate([{$match: {'name': name}}]).exec()
        metacomplete = true
    }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_match.bind(null, tc['tc'], params, local_filter))

    // if no metafilter search was performed, need to look up metadata for anything that matched datafilter
    let metalookup = Promise.resolve(null)
    if(!metacomplete){
        metalookup = datafilter.then(helpers.meta_lookup.bind(null, tc['tcMeta']))
    }

    // send both metafilter and datafilter results to postprocessing:
    Promise.all([metafilter, datafilter, metalookup])
        .then(search_result => {return helpers.postprocess(pp_params, search_result)})
        .then(result => resolve(result))
        .catch(err => reject({"code": 500, "message": "Server error"}))
  });
}


/**
 * Tropical cyclone metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * name String name of tropical cyclone (optional)
 * returns List
 **/
exports.findTCmeta = function(id,name) {
  return new Promise(function(resolve, reject) {

    let match = {
        '_id': id,
        'name': name
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = tc['tcMeta'].aggregate([{$match:match}]);
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}

/**
 * List all possible values for certain tc query string parameters
 *
 * parameter String TC query string parameter to summarize possible values of.
 * returns List
 **/
exports.tcVocab = function(parameter) {
  return new Promise(function(resolve, reject) {

    let lookup = {
        'name': 'name' // <parameter value> : <corresponding key in metadata document>
    }

    tc['tcMeta'].find().distinct(lookup[parameter], function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }
      resolve(vocab)
    })
  });
}
