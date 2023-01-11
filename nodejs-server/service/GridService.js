'use strict';
const Grid = require('../models/grid');
const helpers = require('../helpers/helpers')
const GJV = require('geojson-validation');
const geojsonArea = require('@mapbox/geojson-area');
const summaries = require('../models/summary');
const Transform = require('stream').Transform;

/**
 * Metadata for grids by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/

exports.findgridMeta = function(res,id) {
  return new Promise(function(resolve, reject) {
    const query = Grid[helpers.find_grid_collection(id)+'Meta'].aggregate([{$match:{'_id':id}}]);
    let postprocess = helpers.meta_xform(res)
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
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data minification strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findgrid = function(res,gridName,id,startDate,endDate,polygon,multipolygon,center,radius,compression,mostrecent,data,presRange) {
  return new Promise(function(resolve, reject) {
    // generic helper for all grid search and filter routes
    console.log('>>>>', gridName)
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
    let local_filter = []
    if(id){
        local_filter = [{$match:{'_id':id}}]
    }

    // postprocessing parameters
    let pp_params = {
        compression: compression,
        data: JSON.stringify(data) === '["except-data-values"]' ? null : data, // ie `data=except-data-values` is the same as just omitting the data qsp
        presRange: presRange,
        mostrecent: mostrecent,
        data_adjacent: ['units', 'metadata']
    }

    // metadata table filter: just get the entire table for simplicity's sake, grid metadata is tiny
    let metafilter = Grid[gridName + 'Meta'].find({}).lean().exec()
    let metacomplete = true

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, Grid[gridName], params, local_filter))

    Promise.all([metafilter, datafilter])
        .then(search_result => {

          let stub = function(data, metadata){
              // given a data and corresponding metadata document,
              // return the record that should be returned when the compression=minimal API flag is set
              // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.
              return [
                data['_id'], 
                data.geolocation.coordinates[0], 
                data.geolocation.coordinates[1], 
                data.timestamp
              ]
          }

          let postprocess = grid_post_xform(pp_params, search_result, res, stub)

          resolve([search_result[1], postprocess])

        })

  });
}

/**
 * List all grid names currently available
 *
 * parameter String Grid query string parameter to summarize possible values of. Note grid names correspond exactly to grid data_keys.
 * returns List
 **/
exports.gridVocab = function(parameter) {
  return new Promise(function(resolve, reject) {
    if(parameter == 'data_keys'){
      const query = summaries.find({"_id":"grid_data_keys"}).lean()
      query.exec(helpers.queryCallback.bind(null,x=>x[0]['data_keys'], resolve, reject))
    }
  });
}

let grid_post_xform = function(pp_params, search_result, res, stub){
  // grid-specialized version of the post_xform helper function.

  let nDocs = 0
  const postprocess = new Transform({
    objectMode: true,
    transform(chunk, encoding, next){

      // munge the chunk and push it downstream if it isn't rejected.
      let doc = null
      if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
          /// ie dont even bother with post if we've exceeded our mostrecent cap
          doc = grid_postprocess_stream(chunk, search_result[0], pp_params, stub)
      }
      if(doc){
        if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
          this.push(doc)
        }
        nDocs++
      }
      next()
    }
  });
  
  postprocess._flush = function(callback){
    if(nDocs == 0){
      res.status(404)
      this.push({"code":404, "message": "No documents found matching search."})
    }
    return callback()
  }

  return postprocess
}

let grid_postprocess_stream = function(chunk, metadata, pp_params, stub){
  // grid-specialized version of the postprocess_stream helper
  // recall structure is a bit different for `data`, effectively the transpose of the point data

  // <chunk>: raw data table document
  // <metadata>: full metadata table for this collection
  // <pp_params>: kv which defines level filtering, data selection and compression decisions
  // <stub>: function accepting one data document and its corresponding metadata document, returns appropriate representation for the compression=minimal flag.
  // returns chunk mutated into its final, user-facing form
  // or return false to drop this item from the stream
  // declare some variables at scope
  let keys = []       // data keys to keep when filtering down data
  let notkeys = []    // data keys that disqualify a document if present
  let metadata_only = false

  // determine which data keys should be kept or tossed, if necessary
  if(pp_params.data){
    if(keys.includes('except-data-values')){
      metadata_only = true
      keys.splice(keys.indexOf('except-data-values'))
    }
    keys = pp_params.data.filter(e => e.charAt(0)!='~')
    notkeys = pp_params.data.filter(e => e.charAt(0)=='~').map(k => k.substring(1))
  } else {
    keys = chunk.data_keys
  }

  // bail out on this document if it contains any ~keys:
  if(chunk.data_keys.some(item => notkeys.includes(item))) return false

  // drop non-requested grids, data_keys and corresponding adjacent data
  if(pp_params.data){
    for(let i=0; i<chunk.data_keys.length; i++){
      if(!keys.includes('all') && !keys.includes(chunk.data_keys[i])){
        chunk.data[i] = null
        chunk.data_keys[i] = null
        for(let k=0; k<pp_params.data_adjacent.length; k++){
          chunk[pp_params.data_adjacent[k]][i] = null
        }
      }
    }
    chunk.data = chunk.data.filter(x => x !== null)
    chunk.data_keys = chunk.data_keys.filter(x => x !== null)
    for(let k=0; k<pp_params.data_adjacent.length; k++){
      chunk[pp_params.data_adjacent[k]] = chunk[pp_params.data_adjacent[k]].filter(x => x !== null)
    }
  }

  // use presRange to identify per-grid index ranges, and filter appropriately
  if(pp_params.presRange){
    chunk.levels = []
    for(let i=0; i<chunk.data_keys.length; i++){
      // identify a range of level indexes for this grid
      let meta = metadata.filter(x => x._id == chunk.metadata[i])[0]
      let index_range = []
      index_range[0] = meta.levels.findIndex(n => n >= pp_params.presRange[0]);
      index_range[1] = meta.levels.length - meta.levels.reverse().findIndex(n => n <= pp_params.presRange[1]) - 1;

      meta.levels.reverse() // restore order
      if(index_range[0] == -1) index_range[0] = 0
      if(index_range[1] == -1) index_range[1] = meta.levels.length - 1
    
      // reduce data to levels of interest for this grid
      chunk.data[i] = chunk.data[i].slice(index_range[0], index_range[1]+1)
      // keep track of remaining levels for this grid
      chunk.levels[i] = meta.levels
      chunk.levels[i] = chunk.levels[i].slice(index_range[0], index_range[1]+1)
    }
  }
  
  // abandon doc if data was requested and no levels in any grid are left
  if(pp_params.data && chunk.data.every(x => x.length == 0)){
    return false
  }

  // drop data on metadata only requests
  if(!pp_params.data || metadata_only){
    delete chunk.data
    delete chunk.levels
  }

  // inflate data if requested
  if(!pp_params.compression && chunk.data){
    let d = {}
    for(let i=0; i<chunk.data_keys.length; i++){
      d[chunk.data_keys[i]] = chunk.data[i]
    }
    chunk.data = d
    for(let k=0; k<pp_params.data_adjacent.length; k++){
      let a = {}
      for(let i=0; i<chunk.data_keys.length; i++){
        a[chunk.data_keys[i]] = chunk[pp_params.data_adjacent[k]][i]
      }
      chunk[pp_params.data_adjacent[k]] = a

    }
  }

  // return a minimal stub if requested
  if(pp_params.compression == 'minimal'){
    return stub(chunk, metadata)
  }

  return chunk
}
