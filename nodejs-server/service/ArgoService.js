'use strict';
const argo = require('../models/argo');
const summaries = require('../models/summary');
const helpers = require('../helpers/helpers')
const geojsonArea = require('@mapbox/geojson-area');

/**
 * Summarizes some float-level statistics for Argo BGC floats.
 *
 * returns inline_response_200_2
 **/
exports.argoBGC = function() {
  return new Promise(function(resolve, reject) {
    const query = summaries.find({"_id":"argo_bgc"})
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * Summarizes some datacenter-level statistics about Argo data.
 *
 * returns inline_response_200_1
 **/
exports.argoDACs = function() {
  return new Promise(function(resolve, reject) {
    const query = summaries.find({"_id":"argo_dacs"})
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * Summarizes some collection-level statistics about Argo data.
 *
 * returns inline_response_200
 **/
exports.argoOverview = function() {
  return new Promise(function(resolve, reject) {
    const query = summaries.find({"_id":"argo_overview"})
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * List all possible values for certain Argo query string parameters
 *
 * parameter String Argo query string parameter to summarize possible values of.
 * returns List
 **/
exports.argoVocab = function(parameter) {
  return new Promise(function(resolve, reject) {
    if(parameter == 'source'){
      resolve(['argo_core', 'argo_bgc', 'argo_deep'])
      return
    }
    if(parameter == 'data_keys'){
      const query = summaries.find({"_id":"argo_data_keys"}).lean()
      query.exec(helpers.queryCallback.bind(null,x=>x[0]['data_keys'], resolve, reject))
    }

    let lookup = {
        'platform': 'platform', // <parameter value> : <corresponding key in metadata document>
        'source': 'source.source',
        'metadata': 'metadata',
        'platform_type': 'platform_type'
    }

    let model = null
    if(parameter=='metadata'){
      model = argo['argo']
    } else {
      model = argo['argoMeta']
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
 * metadata String metadata pointer (optional)
 * platform String Unique platform ID to search for. (optional)
 * platform_type String Make/model of platform (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /<data route>/vocabulary?parameter=source for list of options. (optional)
 * compression String Data minification strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * data argo_data_keys Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/

exports.findArgo = function(res, id,startDate,endDate,polygon,multipolygon,center,radius,metadata,platform,platform_type,source,compression,mostrecent,data,presRange) {
  return new Promise(function(resolve, reject) {
    // input sanitization
    let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    // decide y/n whether to service this request
    if(source && ![id,(startDate && endDate),polygon,multipolygon,(center && radius),platform].some(x=>x)){
      reject({"code": 400, "message": "Please combine source queries with at least one of a time range, spatial extent, id or platform search."})
      return
    }
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

    // optional source filtering
    if(source){
      local_filter.push(helpers.source_filter(source))
    }

    // postprocessing parameters
    let pp_params = {
        compression: compression,
        data: JSON.stringify(data) === '["except-data-values"]' ? null : data, // ie `data=except-data-values` is the same as just omitting the data qsp
        presRange: presRange,
        mostrecent: mostrecent,
        data_adjacent: ['units','data_keys_mode'],
        always_import: true // add data_keys and everything in data_adjacent to data docs, no matter what
    }

    // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
    let metafilter = Promise.resolve([{_id: null}])
    let metacomplete = false
    if(platform || platform_type){
        let match = {
            'platform': platform,
            'platform_type': platform_type
        }
        Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

        metafilter = argo['argoMeta'].aggregate([{$match: match}]).exec()
        metacomplete = true
    }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, argo['argo'], params, local_filter))

    Promise.all([metafilter, datafilter])
        .then(search_result => {

          let stub = function(data, metadata){
              // given a data and corresponding metadata document,
              // return the record that should be returned when the compression=minimal API flag is set
              // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.
              
              let sourceset = new Set(data.source.map(x => x.source).flat())

              return [
                data['_id'], 
                data.geolocation.coordinates[0], 
                data.geolocation.coordinates[1], 
                data.timestamp,
                Array.from(sourceset)
              ]
          }

          let postprocess = helpers.post_xform(argo['argoMeta'], pp_params, search_result, res, stub)

          resolve([search_result[1], postprocess])

        })
  });
}

/**
 * Argo metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * platform String Unique platform ID to search for. (optional)
 * returns List
 **/
exports.findArgometa = function(res, id,platform) {
  return new Promise(function(resolve, reject) {
    let match = {
        '_id': id,
        'platform': platform
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = argo['argoMeta'].aggregate([{$match:match}]);
    let postprocess = helpers.meta_xform(res)
    resolve([query.cursor(), postprocess])
  });
}

