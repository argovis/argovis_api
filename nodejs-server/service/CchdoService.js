'use strict';
const cchdo = require('../models/cchdo');
const summaries = require('../models/summary');
const helpers = require('../helpers/helpers')
const geojsonArea = require('@mapbox/geojson-area');

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
 * metadata String metadata pointer (optional)
 * woceline String WOCE line to search for. See /cchdo/vocabulary?parameter=woceline for list of options. (optional)
 * cchdo_cruise BigDecimal CCHDO cruise ID to search for. See /cchdo/vocabulary?parameter=cchdo_cruise for list of options. (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /<data route>/vocabulary?parameter=source for list of options. (optional)
 * compression String Data minification strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/

exports.findCCHDO = function(res, id,startDate,endDate,polygon,multipolygon,center,radius,metadata,woceline,cchdo_cruise,source,compression,mostrecent,data,presRange) {
  return new Promise(function(resolve, reject) {

    // input sanitization
    let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    // decide y/n whether to service this request
    if(source && ![id,(startDate && endDate),polygon,multipolygon,(center && radius),cchdo_cruise,woceline].some(x=>x)){
      reject({"code": 400, "message": "Please combine source queries with at least one of a time range, spatial extent, id, CCHDO cruise ID, or WOCE line search."})
      return
    }
    let bailout = helpers.request_sanitation(params.polygon, null, params.center, params.radius, params.multipolygon) 
    if(bailout){
      reject(bailout)
      return
    }

    // local filter: fields in data collection other than geolocation and timestamp 
    let local_filter = {$match:{}}
    if(id){
        local_filter['$match']['_id'] = id
    }
    if(metadata){
      local_filter['$match']['metadata'] = metadata
    }
    if(Object.keys(local_filter['$match']).length > 0){
      local_filter = [local_filter]
    } else {
      local_filter = []
    }

    // optional source filtering
    if(source){
      local_filter.push(helpers.source_filter(source))
    }

    // postprocessing parameters
    let pp_params = {
        compression: compression,
        data: data,
        presRange: presRange,
        mostrecent: mostrecent
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

        metafilter = cchdo['cchdoMeta'].aggregate([{$match: match}]).exec()
        metacomplete = true
    }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, cchdo['cchdo'], params, local_filter))

    Promise.all([metafilter, datafilter])
        .then(search_result => {
          
          let postprocess = helpers.post_xform(cchdo['cchdoMeta'], pp_params, search_result, res)
          
          resolve([search_result[1], postprocess])
          
        })
  });
}

/**
 * GO-SHIP metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * woceline String WOCE line to search for. See /cchdo/vocabulary?parameter=woceline for list of options. (optional)
 * cchdo_cruise BigDecimal CCHDO cruise ID to search for. See /cchdo/vocabulary?parameter=cchdo_cruise for list of options. (optional)
 * returns List
 **/
exports.findCCHDOmeta = function(res, id,woceline,cchdo_cruise) {
  return new Promise(function(resolve, reject) {
    let match = {
        '_id': id,
        'woce_lines': woceline,
        'cchdo_cruise_id': cchdo_cruise
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = cchdo['cchdoMeta'].aggregate([{$match:match}]);
    let postprocess = helpers.meta_xform(res)
    resolve([query.cursor(), postprocess])
  });
}

/**
 * List all possible values for certain CCHDO query string parameters
 *
 * parameter String GO-SHIP query string parameter to summarize possible values of.
 * returns List
 **/
exports.cchdoVocab = function(parameter) {
  return new Promise(function(resolve, reject) {
    if(parameter == 'data_keys'){
      // data_keys is a summary lookup
      const query = summaries.find({"_id":"cchdo_data_keys"}).lean()
      query.exec(helpers.queryCallback.bind(null,x=>x[0]['data_keys'], resolve, reject))
    }

    let lookup = {
        'woceline': 'woce_lines', // <parameter value> : <corresponding key in metadata document>
        'cchdo_cruise': 'cchdo_cruise_id',
        'source': 'source.source',
        'metadata': 'metadata'
    }

    let model = null
    if(parameter=='source' || parameter=='metadata'){
      model = cchdo['cchdo']
    } else {
      model = cchdo['cchdoMeta']
    }

    model.find().distinct(lookup[parameter], function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }
      resolve(vocab)
    })
  });
}