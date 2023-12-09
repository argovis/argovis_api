'use strict';
const argone = require('../models/argone');
const GJV = require('geojson-validation');
const pointInPolygon = require('@turf/boolean-point-in-polygon').default;
const helpers = require('../helpers/helpers')

/**
 * Probabilities of floats moving between two points in a range of forecast projections
 *
 * id String Unique ID to search for. (optional)
 * forecastOrigin List Longitude,latitude of forecast origin location. (optional)
 * forecastGeolocation List Longitude,latitude of forecast destination location. (optional)
 * metadata String metadata pointer (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Forecast durations to include. Return only documents that have all data requested. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.findargone = function(res, id,forecastOrigin,forecastGeolocation,metadata,compression,data) {
  return new Promise(function(resolve, reject) {

    // decide y/n whether to service this request; sanitize inputs
    if(!forecastOrigin && !forecastGeolocation && !id){
        reject({"code": 400, "message": "please specify at least one of forecastOrigin, forecastGeolocation and/or id"})
        return
    }
    if(forecastOrigin){
        forecastOrigin = {"type": "Point", "coordinates": forecastOrigin}
        if (!GJV.valid(forecastOrigin) || !GJV.isPoint(forecastOrigin)){
            reject({"code": 400, "message": "forecastOrigin must be a valid <longitude,latitude>"});
            return;
        }
    }
    if(forecastGeolocation){
        forecastGeolocation = {"type": "Point", "coordinates": forecastGeolocation}
        if (!GJV.valid(forecastGeolocation) || !GJV.isPoint(forecastGeolocation)){
            reject({"code": 400, "message": "forecastGeolocation must be a valid <longitude,latitude>"});
            return;
        }
    }

    // local filter: fields in data collection other than geolocation and timestamp 
    let local_filter = []
    if(forecastOrigin){
        local_filter.push({'$geoNear': {'near': forecastOrigin, 'maxDistance': 1, 'distanceField': 'dist',  'key': 'geolocation'}})
    }
    if(forecastGeolocation){
        local_filter.push({'$geoNear': {'near': forecastGeolocation, 'maxDistance': 1, 'distanceField': 'dist',  'key': 'geolocation_forecast'}})
    }
    if(id){
        local_filter.push({'$match':{'_id': id}})
    }

    // postprocessing parameters
    let pp_params = {
        compression: compression,
        data: JSON.stringify(data) === '["except-data-values"]' ? null : data, // ie `data=except-data-values` is the same as just omitting the data qsp
        junk: ['dist'],
        suppress_meta: compression=='minimal', // don't need to look up argo metadata if making a minimal request
        batchmeta : batchmeta
    }

    // can we afford to project data documents down to a subset in aggregation?
    let projection = null
    if(compression=='minimal' && data==null){
      projection = ['_id', 'metadata', 'geolocation', 'geolocation_forecast']
    }

    // metadata table filter: no-op promise stub, nothing to filter grid data docs on from metadata at the moment
    let metafilter = Promise.resolve([])
    let metacomplete = false

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, argone['argone'], {batchmeta:batchmeta}, local_filter, projection, null))

    let batchmetafilter = datafilter.then(helpers.metatable_stream.bind(null, pp_params.batchmeta, argo['argoMeta']))
    
    Promise.all([metafilter, datafilter, batchmetafilter])
        .then(search_result => {
          let stub = function(data, metadata){
              // given a data and corresponding metadata document,
              // return the record that should be returned when the compression=minimal API flag is set
              // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.
              return [
                data['_id'],
                data.geolocation.coordinates[0], 
                data.geolocation.coordinates[1], 
                data.geolocation_forecast.coordinates[0], 
                data.geolocation_forecast.coordinates[1],
                data['metadata']
              ]
          }

          let postprocess = helpers.post_xform(argone['argoneMeta'], pp_params, search_result, res, stub)

          res.status(404) // 404 by default
          if(pp_params.batchmeta){
            resolve([search_result[2], postprocess])
          } else {
            resolve([search_result[1], postprocess])
          }

        })

  });
}

/**
 * argone metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findargoneMeta = function(res,id) {
  return new Promise(function(resolve, reject) {
    if(id !== 'argone'){
      reject({
        code: 404,
        message: "No float location metadata matching ID " + id + "; all float location metadata is stored in the single document id=argone"
      })
    }
    const query = argone['argoneMeta'].aggregate([{$match:{'_id':id}}]);
    let postprocess = helpers.meta_xform(res)
    res.status(404) // 404 by default
    resolve([query.cursor(), postprocess])
  });
}



