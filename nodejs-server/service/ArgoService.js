'use strict';
const argo = require('../models/argo');
const bap = require('../models/bap');
const summaries = require('../models/summary');
const helpers = require('../helpers/helpers')

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
    if(parameter == 'enum'){
      resolve(["platform", "source", "data", "metadata", "platform_type", "position_qc"])
      return
    } else if(parameter == 'source'){
      resolve(['argo_core', 'argo_bgc', 'argo_deep'])
      return
    } else if(parameter == 'data'){
      const query = summaries.find({"_id":"argo_data_keys"}).lean()
      query.exec(helpers.queryCallback.bind(null,x=>x[0]['data_keys'], resolve, reject))
    } else {

      let lookup = {
          'platform': 'platform', // <parameter value> : <corresponding key in metadata document>
          'source': 'source.source',
          'metadata': 'metadata',
          'platform_type': 'platform_type',
          'position_qc': 'geolocation_argoqc'
      }

      let model = null
      if(parameter=='position_qc' || parameter == 'metadata'){
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
    }
  });
}


/**
 * List all possible values for certain BGC Argo+ query string parameters
 *
 * parameter String BGC Argo+ query string parameter to summarize possible values of.
 * returns List
 **/
exports.bapVocab = function(parameter) {
    return new Promise(function(resolve, reject) {
        if(parameter == 'enum'){
          resolve(["platform", "data", "metadata", "platform_type", "position_qc"])
          return
        } else if(parameter == 'data'){
          const query = summaries.find({"_id":"bgcargoplus_data_keys"}).lean()
          query.exec(helpers.queryCallback.bind(null,x=>x[0]['data_keys'], resolve, reject))
        } else {
    
          let lookup = {
              'platform': 'platform', // <parameter value> : <corresponding key in metadata document>
              'metadata': 'metadata',
              'platform_type': 'platform_type',
              'position_qc': 'geolocation_argoqc'
          }
    
          let model = null
          if(parameter=='position_qc' || parameter == 'metadata'){
            model = bap['bgcargoplus']
          } else {
            model = bap['bgcargoplusMeta']
          }
    
          model.find().distinct(lookup[parameter], function (err, vocab) {
            if (err){
              reject({"code": 500, "message": "Server error"});
              return;
            }
            resolve(vocab)
          })
        }
      });
}

function collectionSearch(collection, datamodel, metamodel, res,id,startDate,endDate,polygon,box,center,radius,metadata,platform,platform_type,positionqc,source,compression,data,presRange,verticalRange,batchmeta){
    // generic logic to search over argo and argo-like data collections.

    return new Promise(function(resolve, reject) {
        // input sanitization
        let params = helpers.parameter_sanitization(collection,id,startDate,endDate,polygon,box,false,center,radius)
        if(params.hasOwnProperty('code')){
          // error, return and bail out
          reject(params)
          return
        }
        params.verticalRange = presRange || verticalRange
        params.metacollection = collection+'Meta'
        if(data && data.join(',') !== 'except-data-values'){
          params.data_query = helpers.parse_data_qsp(data.join(','))
          params.qc_suffix = '_argoqc'
    
          if(!('pressure' in params.data_query[0]) && !('pressure' in params.data_query[2])){
            // pull pressure out of mongo by default
            params.data_query[2]['pressure'] = []
            params.coerced_pressure = true
          }
        }
        params.lookup_meta = batchmeta
        params.compression = compression
        params.batchmeta = batchmeta
        // decide y/n whether to service this request
        if(source && ![id,(startDate && endDate),polygon,(center && radius),platform].some(x=>x)){
          reject({"code": 400, "message": "Please combine source queries with at least one of a time range, spatial extent, id or platform search."})
          return
        }
        let bailout = helpers.request_sanitation(params.polygon, params.center, params.radius, params.box, false, presRange, verticalRange) 
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
        if(positionqc){
          local_filter['$match']['geolocation_argoqc'] = {'$in': positionqc}
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
    
        // can we afford to project data documents down to a subset in aggregation?
        if(compression=='minimal' && data==null && presRange==null && verticalRange==null){
          params.projection = ['_id', 'metadata', 'geolocation', 'timestamp', 'source']
        }
    
        // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
        let metafilter = Promise.resolve([])
        params.metafilter = false
        if(platform || platform_type){
            let match = {
                'platform': platform,
                'platform_type': platform_type
            }
            Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);
    
            metafilter = metamodel.aggregate([{$match: match}]).exec()
            params.metafilter = true
        }
    
        // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
        let datafilter = metafilter.then(helpers.datatable_stream.bind(null, datamodel, params, local_filter))
        
        Promise.all([metafilter, datafilter])
            .then(search_result => {
    
              let stub = function(data){
                  // given a data document,
                  // return the record that should be returned when the compression=minimal API flag is set
                  // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.
                  
                  let sourceset = new Set(data.source.map(x => x.source).flat())
    
                  return [
                    data['_id'], 
                    data.geolocation.coordinates[0], 
                    data.geolocation.coordinates[1], 
                    data.timestamp,
                    Array.from(sourceset),
                    data['metadata']
                  ]
              }
              
              let postprocess = helpers.post_xform(params, search_result, res, stub)
    
              res.status(404) // 404 by default
    
              resolve([search_result[1], postprocess])
            })
      });
}

function metasearch(metamodel, res, id,platform){
    // generic search of argo-like meta collections
    return new Promise(function(resolve, reject) {
        let match = {
            '_id': id,
            'platform': platform
        }
        Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);
    
        const query = metamodel.aggregate([{$match:match}]);
        let postprocess = helpers.meta_xform(res)
        res.status(404) // 404 by default
        resolve([query.cursor(), postprocess])
      });
}

/**
 * Argo search and filter.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String lon, lat pairs of the lower left and upper right corners of a box on a mercator projection, packed like [[lower left lon, lower left lat],[upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * metadata String metadata pointer (optional)
 * platform String Unique platform ID to search for. (optional)
 * platform_type String Make/model of platform (optional)
 * positionqc List Argo position qc flag. (optional)
 * source List Experimental program source(s) to search for; document must match all sources to be returned. Accepts ~ negation to filter out documents. See /<data route>/vocabulary?parameter=source for list of options. (optional)
 * compression String Data minification strategy to apply. (optional)
 * data argo_data_keys Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List DEPRICATED, please use verticalRange instead. Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * verticalRange List Vertical range to filter for in pressure or depth as appropriate for this dataset; levels outside this range will not be returned. (optional)
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.findArgo = function(res,id,startDate,endDate,polygon,box,center,radius,metadata,platform,platform_type,positionqc,source,compression,data,presRange,verticalRange,batchmeta) {
    return collectionSearch('argo', argo['argo'], argo['argoMeta'], res,id,startDate,endDate,polygon,box,center,radius,metadata,platform,platform_type,positionqc,source,compression,data,presRange,verticalRange,batchmeta)
}

/**
 * Argo metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * platform String Unique platform ID to search for. (optional)
 * returns List
 **/
exports.findArgometa = function(res, id,platform) {
    return metasearch(argo['argoMeta'], res, id,platform)
}


/**
 * BGC Argo+ search and filter.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String lon, lat pairs of the lower left and upper right corners of a box on a mercator projection, packed like [[lower left lon, lower left lat],[upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * metadata String metadata pointer (optional)
 * platform String Unique platform ID to search for. (optional)
 * platform_type String Make/model of platform (optional)
 * positionqc List Argo position qc flag. (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List DEPRICATED, please use verticalRange instead. Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * verticalRange List Vertical range to filter for in pressure or depth as appropriate for this dataset; levels outside this range will not be returned. (optional)
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.findBAP = function(res, id,startDate,endDate,polygon,box,center,radius,metadata,platform,platform_type,positionqc,compression,data,presRange,verticalRange,batchmeta) {
    return collectionSearch('bgcargoplus', bap['bgcargoplus'], bap['bgcargoplusMeta'], res,id,startDate,endDate,polygon,box,center,radius,metadata,platform,platform_type,positionqc,null,compression,data,presRange,verticalRange,batchmeta)
}


/**
 * BGC Argo+ metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * platform String Unique platform ID to search for. (optional)
 * returns List
 **/
exports.findBAPmeta = function(res, id,platform) {
    return metasearch(bap['bgcargoplusMeta'], res, id,platform)
}

