'use strict';
const Grid = require('../models/grid');
const helpers = require('../helpers/helpers')
const GJV = require('geojson-validation');
const summaries = require('../models/summary');

/**
 * Metadata for grids by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/

exports.findgridMeta = function(res,id) {
  return new Promise(function(resolve, reject) {
    let gridMetaCollection = helpers.find_grid_metacollection(id)
    if(gridMetaCollection === ''){
      reject({
        code: 404,
        message: "No grid product matching ID " + id
      })
    }
    const query = Grid[gridMetaCollection].aggregate([{$match:{'_id':id}}]);
    let postprocess = helpers.meta_xform(res)
    res.status(404) // 404 by default
    resolve([query.cursor(), postprocess])
  });
}

/**
 * Search and filter for grid named in path
 *
 * gridName String 
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String lon, lat pairs of the lower left and upper right corners of a box on a mercator projection, packed like [[lower left lon, lower left lat],[upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List DEPRICATED, please use verticalRange instead. Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * verticalRange List Vertical range to filter for in pressure or depth as appropriate for this dataset; levels outside this range will not be returned. (optional)
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.findgrid = function(res,gridName,id,startDate,endDate,polygon,box,center,radius,compression,data,presRange,verticalRange,batchmeta) {
  return new Promise(function(resolve, reject) {
    // generic helper for all grid search and filter routes
    // input sanitization
    let params = helpers.parameter_sanitization(gridName,id,startDate,endDate,polygon,box,false,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    if(gridName === 'localGPintegral'){
        params.metacollection = 'localGPMeta'
        verticalRange = null // not obvious how to filter integral ranges by vertical bounds, decline for now.
        presRange = null
    } else {
        params.metacollection = gridName+'Meta'
    }
    params.is_grid = true
    params.genericMeta = true // the summaries collection has a generic metadata document that applies to all data docs in a given grid collection
    params.verticalRange = presRange || verticalRange
    if(data && data.join(',') !== 'except-data-values'){
      params.data_query = helpers.parse_data_qsp(data.join(','))
    }
    params.lookup_meta = batchmeta
    params.compression = compression
    params.batchmeta = batchmeta
    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.polygon, params.center, params.radius, params.box, false, presRange, verticalRange, params.compression, params.batchmeta) 
    if(bailout){
      reject(bailout)
      return
    }

    // bespoke sanitization for glodap
    if(gridName === 'glodap' && presRange){
      reject({"code": 400, "message": "Pressure range filtering is not supported for GLODAP; use verticalRange instead."})
      return
    }

    // local filter: fields in data collection other than geolocation and timestamp 
    let local_filter = []
    if(id){
        local_filter = [{$match:{'_id':id}}]
    }

    // can we afford to project data documents down to a subset in aggregation?
    if(compression=='minimal' && data==null && presRange==null && verticalRange==null){
      params.projection = ['_id', 'metadata', 'geolocation', 'timestamp']
    }

    // metadata table filter: nothing to filter on in meta collection, use this to fetch a generic metadata doc
    // some grids have exactly one metadata doc, others have a summarized generic metadata doc.
    let metafilter = Promise.resolve([])
    if(gridName === 'glodap'){
        metafilter = Grid['glodapMeta'].find({_id:'glodapv2.2016b'}).lean().exec()
    } else if(gridName === 'localGPintegral'){
        metafilter = Grid['localGPMeta'].find({_id:'localGPintegral'}).lean().exec()
    } else {
        metafilter = summaries.find({_id:gridName+'GenericMeta'}).lean().exec()
    }
    params.metafilter = false

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, Grid[gridName], params, local_filter))
    Promise.all([metafilter, datafilter])
        .then(search_result => {
          let stub = function(data){
              // given a data and corresponding metadata document,
              // return the record that should be returned when the compression=minimal API flag is set
              // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.
              return [
                data['_id'], 
                data.geolocation.coordinates[0], 
                data.geolocation.coordinates[1], 
                data.timestamp,
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
 * List data and lattice for the requested grid.
 *
 * gridName String 
 * parameter String categorical grid search and filter parameters
 * returns List
 **/
exports.gridVocab = function(gridName,parameter) {
  return new Promise(function(resolve, reject) {
    if(parameter == 'enum'){
      resolve(["data"])
      return
    } else {
      let lookup = {
        'data': 'data_info.0'
      }

      Grid[helpers.find_grid_metacollection(gridName)].find().distinct(lookup[parameter], function (err, vocab) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        resolve(vocab)
      })
    }
  });
}
