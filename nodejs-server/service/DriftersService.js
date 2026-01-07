'use strict';
const Drifter = require('../models/drifter');
const helpers = require('../helpers/helpers')
const summaries = require('../models/summary');

/**
 * Search, reduce and download drifter metadata.
 *
 * id String Unique ID to search for. (optional)
 * platform String Unique platform ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/

exports.drifterMetaSearch = function(res,id,platform,wmo) {
  return new Promise(function(resolve, reject) {
    let match = {
        '_id': id, 
        'wmo': wmo,
        'platform': platform
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = Drifter['driftersMeta'].aggregate([{$match:match}]);
    let postprocess = helpers.meta_xform(res)
    res.status(404) // 404 by default
    resolve([query.cursor(), postprocess])
  });
}


/**
 * Search, reduce and download drifter data.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String lon, lat pairs of the lower left and upper right corners of a box on a mercator projection, packed like [[lower left lon, lower left lat],[upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * metadata String metadata pointer (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * platform String Unique platform ID to search for. (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.drifterSearch = function(res,id,startDate,endDate,polygon,box,center,radius,metadata,wmo,platform,compression,data,batchmeta) {
  return new Promise(function(resolve, reject) {
    // input sanitization
    let params = helpers.parameter_sanitization('drifters',id,startDate,endDate,polygon,box,false,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }
    params.batchmeta = batchmeta
    params.compression = compression
    params.metacollection = 'driftersMeta'
    params.genericMeta = true // the summaries collection has a generic metadata document that applies to all data docs in the corresponding data collection.
    if(data && data.join(',') !== 'except-data-values'){
      params.data_query = helpers.parse_data_qsp(data.join(','))
    }
    params.lookup_meta = (compression === 'minimal') || batchmeta // use the single-lookup metafilter for this collection since data_info is all the same, unless we're doing stubs in which case we need the wmo number from the metadata document
    params.compression = compression
    params.batchmeta = batchmeta

    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.polygon, params.center, params.radius, params.box, false, null, null) 
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

    // can we afford to project data documents down to a subset in aggregation?
    if(compression=='minimal' && data==null){
      params.projection = ['_id', 'metadata', 'geolocation', 'timestamp', 'metadata_docs']
    }

    // metadata table filter: arbitrary document if nothing to filter metadata for, custom search otherwise
    let metafilter = Promise.resolve([]) 
    if(wmo||platform){
        let match = {
            'wmo': wmo,
            'platform': platform
        }
        Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

        metafilter = Drifter['driftersMeta'].aggregate([{$match: match}]).exec()
        params.metafilter = true
    } else {
      metafilter = summaries.find({_id:'driftersGenericMeta'}).lean().exec()
      params.metafilter = false
    }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, Drifter['drifters'], params, local_filter))

    Promise.all([metafilter, datafilter])
        .then(search_result => {

          let stub = function(data){
              // given a data document,
              // return the record that should be returned when the compression=minimal API flag is set
              // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.

              return [
                data['_id'], 
                data.geolocation.coordinates[0], 
                data.geolocation.coordinates[1], 
                data.timestamp,
                data.metadata_docs[0].wmo,
                data['metadata']
              ]
          }

          let postprocess = helpers.post_xform(params, search_result, res, stub)
          res.status(404) // 404 by default
          resolve([search_result[1], postprocess])
        })
    
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
    if(parameter == 'enum'){
      resolve(["wmo", "platform", "data", "metadata"])
      return
    } else if(parameter == 'data'){
      resolve([
        "ve",
        "vn",
        "err_lon",
        "err_lat",
        "err_ve",
        "err_vn",
        "gap",
        "sst",
        "sst1",
        "sst2",
        "err_sst",
        "err_sst1",
        "err_sst2",
        "flg_sst",
        "flg_sst1",
        "flg_sst2"
      ])
      return
    } else if(parameter == 'metadata'){
      Drifter['drifters'].find().distinct('metadata', function (err, vocab) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        resolve(vocab)
      })
    } else {
      if(parameter =='wmo' || parameter == 'platform'){
        let lookup = {
            'wmo': 'wmo', // <parameter value> : <corresponding key in metadata document>
            'platform': 'platform'
        }

        Drifter['driftersMeta'].find().distinct(lookup[parameter], function (err, vocab) {
          if (err){
            reject({"code": 500, "message": "Server error"});
            return;
          }
          resolve(vocab)
        })
      }
    }
  });
}

