'use strict';
const Timeseries = require('../models/timeseries');
const helpers = require('../helpers/helpers')
const GJV = require('geojson-validation');
const summaries = require('../models/summary');

/**
 * Search and filter for timeseries named in path
 *
 * timeseriesName String 
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String lon, lat pairs of the lower left and upper right corners of a box on a mercator projection, packed like [[lower left lon, lower left lat],[upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * verticalRange List Vertical range to filter for in pressure or depth as appropriate for this dataset; levels outside this range will not be returned. (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.findtimeseries = function(res,timeseriesName,id,startDate,endDate,polygon,box,center,radius,verticalRange,compression,data,batchmeta) {
  return new Promise(function(resolve, reject) {
    // generic helper for all timeseries search and filter routes
    // note verticalRange ignored for now since all current timeseries served by this API are surface only, just allowed in order to match BSOSE's rust API
    // input sanitization
    let params = helpers.parameter_sanitization(timeseriesName,id,startDate,endDate,polygon,box,false,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    params.is_timeseries = true
    params.genericMeta = true // each timeseries collection has exactly one meta doc, which counts as generic.
    if(data && data.join(',') !== 'except-data-values'){
      params.data_query = helpers.parse_data_qsp(data.join(','))
    }
    params.metacollection = 'timeseriesMeta'
    params.lookup_meta = false // there's just one per satellite, so we don't need to look up metadata for each data document
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
    if(Object.keys(local_filter['$match']).length > 0){
      local_filter = [local_filter]
    } else {
      local_filter = []
    }

    // can we afford to project data documents down to a subset in aggregation?
    if(compression=='minimal' && data==null){
      params.projection = ['_id', 'metadata', 'geolocation']
    }

    // always fetch the metadata doc so we can pull the full list of timesteps off of it
    let metafilter = Timeseries['timeseriesMeta'].find({"_id": timeseriesName}).lean().exec()
    params.metafilter = false

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, Timeseries[timeseriesName], params, local_filter))

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
 * Metadata for timeseries by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findtimeseriesMeta = function(res, id) {
  return new Promise(function(resolve, reject) {
    let match = {
      '_id': id
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = Timeseries['timeseriesMeta'].aggregate([{$match:match}]);
    let postprocess = helpers.meta_xform(res)
    res.status(404) // 404 by default
    resolve([query.cursor(), postprocess])  
  })
}


/**
 * List data and lattice for the requested timeseries.
 *
 * timeseriesName String 
 * parameter String categorical timeseries search and filter parameters
 * returns List
 **/
exports.timeseriesVocab = function(timeseriesName,parameter) {
  return new Promise(function(resolve, reject) {
    if(parameter == 'enum'){
      resolve(["data"])
      return
    } else{
      let metaid = {
        "noaasst":"noaasst", 
        "copernicussla":"copernicussla", 
        "ccmpwind":"ccmpwind"
      }[timeseriesName]

      const query = Timeseries['timeseriesMeta'].find({"_id":metaid}).lean()
      query.exec(helpers.queryCallback.bind(null,x=>x[0]["data_info"][0], resolve, reject))
    }
  });
}

