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
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.findargone = function(res, id,forecastOrigin,forecastGeolocation,metadata,compression,data,batchmeta) {
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

    // metadata table filter: just get the sole solitary argon metadata doc
    let metafilter = argone['argoneMeta'].find({_id:'argone'}).lean().exec()
    let params = {
      'metafilter': false,
      'batchmeta': batchmeta,
      'metacollection': 'argoneMeta',
      'junk': ['dist'],
      'compression': compression,
      'batchmeta': batchmeta,
    }
    if(data && data.join(',') !== 'except-data-values'){
      params.data_query = helpers.parse_data_qsp(data.join(','))
    }
    params.lookup_meta = false
    params.genericMeta = true // the sole metadata doc counts as effectively generic.

    // can we afford to project data documents down to a subset in aggregation?
    if(compression=='minimal' && data==null){
      params.projection = ['_id', 'metadata', 'geolocation', 'geolocation_forecast']
    }

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, argone['argone'], params, local_filter))

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
                data.geolocation_forecast.coordinates[0],
                data.geolocation_forecast.coordinates[1],
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



