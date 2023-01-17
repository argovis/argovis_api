'use strict';
const covar = require('../models/covar');
const GJV = require('geojson-validation');
const pointInPolygon = require('@turf/boolean-point-in-polygon').default;
const helpers = require('../helpers/helpers')
const gridHelpers = require('../helpers/gridHelpers')

/**
 * Probability distribution field for a float at point lat-lon after forcastDays.
 *
 * lat BigDecimal latitude (degrees) of Argo float location
 * lon BigDecimal longitude (degrees) of Argo float location
 * forcastDays BigDecimal number of days over which to project Argo float drift
 * returns CovarSchema
 **/
exports.findCovar = function(lat,lon,forcastDays) {
  return new Promise(function(resolve, reject) {
    var point = {"type": "Point", "coordinates": [lon,lat]};
    if (!GJV.valid(point) || !GJV.isPoint(point)){
        reject({"code": 400, "message": "Invalid lat/lon."});
        return;
    }

    const query = covar['covar'].findOne({forcastDays: forcastDays, geolocation: {
                                $near: {
                                    $geometry: point
                                    //$maxDistance: radius
                                }
                            }
                            });

    query.exec(function (err, covars) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }

        if (covars == null){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        resolve(covars);
    })
  });
}


/**
 * Probabilities of floats moving between two points in a range of forecast projections
 *
 * id String Unique ID to search for. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * forecastGeolocation List Longitude,latitude of forecast location. (optional)
 * metadata String metadata pointer (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Forecast durations to include. Return only documents that have all data requested. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.findCovariance = function(id,polygon,multipolygon,center,radius,forecastGeolocation,metadata,compression,data) {
  return new Promise(function(resolve, reject) {

    // input sanitization
    let params = helpers.parameter_sanitization(id,null,null,polygon,multipolygon,center,radius)
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
    if(forecastGeolocation){
      local_filter['$match']['geolocation_forecast'] = forecastGeolocation
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
        data_adjacent: ['units', 'metadata']
    }

    // metadata table filter: just get the entire table for simplicity's sake, there's only one document
    let metafilter = covar['covarianceMeta'].find({}).lean().exec()
    let metacomplete = true

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, covar['covariance'], params, local_filter))

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
                data.geolocation_forecast.coordinates[0], 
                data.geolocation_forecast.coordinates[1], 
                data.timestamp
              ]
          }

          let postprocess = gridHelpers.grid_post_xform(pp_params, search_result, res, stub)

          resolve([search_result[1], postprocess])

        })

  });
}


/**
 * Covariance metadata search and filter.
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findCovariancerMeta = function(res,id) {
  return new Promise(function(resolve, reject) {
    const query = covar['covarianceMeta'].aggregate([{$match:{'_id':id}}]);
    let postprocess = helpers.meta_xform(res)
    resolve([query.cursor(), postprocess])
  });
}



/**
 * Sum of probability distribution field over a region for a float starting at point lat-lon after forcastDays.
 *
 * lat BigDecimal latitude (degrees) of Argo float location
 * lon BigDecimal longitude (degrees) of Argo float location
 * forcastDays BigDecimal number of days over which to project Argo float drift
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * returns inline_response_200
 **/
exports.sumCovar = function(lat,lon,forcastDays,polygon) {
  return new Promise(function(resolve, reject) {
    var point = {"type": "Point", "coordinates": [lon,lat]};
    if (!GJV.valid(point) || !GJV.isPoint(point)){
        reject({"code": 400, "message": "Invalid lat/lon."});
        return;
    }

    const query = covar['covar'].findOne({forcastDays: forcastDays, geolocation: {
                                $near: {
                                    $geometry: point
                                    //$maxDistance: radius
                                }
                            }
                            });

    query.exec(function (err, covars) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }
        if (covars == null){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }

        polygon = {
            "type": "Polygon",
            "coordinates": [JSON.parse(polygon)]
        }
        let p = covars.features.map(x => x.properties.Probability*(pointInPolygon(x.geometry, polygon) ? 1:0)).reduce((a, b) => a + b, 0)
        resolve({"sum":p});
    })
  });
}

