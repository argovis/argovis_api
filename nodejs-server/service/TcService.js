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
    let pp_params = null

    // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
    let metafilter = Promise.resolve(null)
    if(name){
        metafilter = tc['tcMeta'].aggregate([{$match: {'name': name}}]).exec()
    }

    // perform db searches, parse and return
    metafilter
        .then(meta => helpers.datatable_match.bind(null, tc['tc'], params, local_filter)(meta) )
        .then(raw => helpers.postprocess.bind(null,pp_params)(raw) ) 
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
    if((name || year) && (startDate || endDate)){
        reject({"code": 400, "message": "Please search for TC by providing startDate and endDate, OR name and year."});
        return;
    }
    if((name && !year) || (year && !name)){
        reject({"code": 400, "message": "Please provide both name and year, not just one."});
        return;
    }
    if((startDate && !endDate) || (endDate && !startDate)){
        reject({"code": 400, "message": "Please provide both startDate and endDate, no more than 3 months apart."});
        return;
    }

    let filter = {}
    if(name && year){
        const tc_name = name.toUpperCase()
        filter = {name: tc_name, year: year}
    } else if (startDate && endDate){
        const sDate = moment(startDate, 'YYYY-MM-DDTHH:mm:ss')
        const eDate = moment(endDate, 'YYYY-MM-DDTHH:mm:ss')
        const dateDiff = eDate.diff(sDate)
        const monthDiff = Math.floor(moment.duration(dateDiff).asMonths())
        if (monthDiff > 3) {
            reject({"code": 400, "message": "Query timespan exceeds 3 months; please search for a smaller period."})
            return;
        }
        filter = {$or: [
          {$and: [ {startDate: {$lte: startDate}}, {endDate: {$gte: endDate} }] },    // cyclone completely within timespan
          {$and: [ {endDate: {$gte: startDate}}, {endDate: {$lte: endDate} }] },      // cyclone ends during timespan
          {$and: [ {startDate: {$gte: startDate}}, {startDate: {$lte: endDate} }] }   // cyclone begins during timespan
        ]}
    }

    const query = tcTraj.find(filter)

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
    var examples = {};
    examples['application/json'] = [ "", "" ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}
