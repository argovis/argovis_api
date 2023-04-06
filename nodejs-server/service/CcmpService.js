'use strict';
const Ccmp = require('../models/ccmp');
const helpers = require('../helpers/helpers')
const summaries = require('../models/summary');

/**
 * Search, reduce and download ccmp metadata.
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.ccmpMetaSearch = function(id) {
  return new Promise(function(resolve, reject) {
    let match = {
        '_id': id
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = Ccmp['ccmpMeta'].aggregate([{$match:match}]);
    let postprocess = helpers.meta_xform(res)
    res.status(404) // 404 by default
    resolve([query.cursor(), postprocess])
  });
}


/**
 * Search, reduce and download ccmp data.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * metadata String metadata pointer (optional)
 * compression String Data minification strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.ccmpSearch = function(id,startDate,endDate,polygon,multipolygon,center,radius,metadata,compression,mostrecent,data) {
  return new Promise(function(resolve, reject) {
    // input sanitization
    let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.polygon, params.center, params.radius, params.multipolygon) 
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

    // postprocessing parameters
    let pp_params = {
        compression: compression,
        data: JSON.stringify(data) === '["except-data-values"]' ? null : data, // ie `data=except-data-values` is the same as just omitting the data qsp
        presRange: null,
        mostrecent: mostrecent
    }

    // can we afford to project data documents down to a subset in aggregation?
    let projection = null
    if(compression=='minimal' && data==null){
      projection = ['_id', 'metadata', 'geolocation', 'timeseries']
    }

    // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
    let metafilter = Promise.resolve([])
    let metacomplete = false

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, Ccmp['ccmp'], params, local_filter, projection))

    Promise.all([metafilter, datafilter])
        .then(search_result => {

          let stub = function(data, metadata){
              // given a data and corresponding metadata document,
              // return the record that should be returned when the compression=minimal API flag is set
              // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.
              return [
                data['_id'], 
                data.geolocation.coordinates[0], 
                data.geolocation.coordinates[1]
              ]
          }

          let postprocess = helpers.post_xform(Ccmp['ccmpMeta'], pp_params, search_result, res, stub)
          res.status(404) // 404 by default
          resolve([search_result[1], postprocess])

        })
  });
}


/**
 * List all possible values for certain ccmp query string parameters
 *
 * parameter String /ccmp query string parameter to summarize possible values of.
 * returns List
 **/
exports.ccmpVocab = function(parameter) {
  return new Promise(function(resolve, reject) {
    if(parameter == 'data'){
      resolve(["uwnd", "vwnd", "ws", "nobs"])
      return
    }
  });
}

