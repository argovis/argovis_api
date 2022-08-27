'use strict';
const Grid = require('../models/grid');
const helpers = require('../helpers/helpers')
const GJV = require('geojson-validation');
const geojsonArea = require('@mapbox/geojson-area');

/**
 * Metadata for grids by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/

exports.findgridMeta = function(res,id) {
  return new Promise(function(resolve, reject) {
    const query = Grid.gridMeta.aggregate([{$match:{'_id':id}}]);
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
 * compression String Data compression strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findgrid = function(res,gridName,id,startDate,endDate,polygon,multipolygon,center,radius,compression,mostrecent,data,presRange) {
  return new Promise(function(resolve, reject) {
    // generic helper for all grid search and filter routes

    // input sanitization
    let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.polygon, null, params.center, params.radius, params.multipolygon) 
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
        data: data,
        presRange: presRange,
        mostrecent: mostrecent
    }

    // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
    /// currently no explicit metadata parameters to start search on for grid, but leaving the boilerplate in anyway...
    let metafilter = Promise.resolve([{_id: null}])
    let metacomplete = false
    // if(name){
    //     metafilter = tc['tcMeta'].aggregate([{$match: {'name': name}}]).exec()
    //     metacomplete = true
    // }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, Grid[gridName], params, local_filter))

    Promise.all([metafilter, datafilter])
        .then(search_result => {

          let postprocess = helpers.post_xform(Grid['gridMeta'], pp_params, search_result, res)

          resolve([search_result[1], postprocess])

        })

  });
}

/**
 * List all grid names currently available
 *
 * returns List
 **/
exports.gridVocab = function() {
  return new Promise(function(resolve, reject) {
    Grid['gridMeta'].find().distinct('data_keys', function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }
      resolve(vocab)
    })
  });
}
