'use strict';
const Extended = require('../models/extended');
const helpers = require('../helpers/helpers')
const GJV = require('geojson-validation');
const summaries = require('../models/summary');

/**
 * Vocab data for the named extended object.
 *
 * extendedName String 
 * parameter String categorical extended object search and filter parameters
 * returns List
 **/
exports.extendedVocab = function(extendedName,parameter) {
  return new Promise(function(resolve, reject) {
    if(parameter == 'enum'){
      resolve(["data"])
      return
    } else {
      if(parameter == 'data'){
        const query = Extended['extendedMeta'].find({"_id":extendedName}).lean()
        query.exec(helpers.queryCallback.bind(null,x=>x[0]['data_info'][0], resolve, reject))
      }
    }
  });
}


/**
 * Search and filter for extended object named in path
 *
 * extendedName String 
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String lon, lat pairs of the lower left and upper right corners of a box on a mercator projection, packed like [[lower left lon, lower left lat],[upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data minification strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.findExtended = function(res,extendedName,id,startDate,endDate,polygon,box,center,radius,compression,data,batchmeta) {
  return new Promise(function(resolve, reject) {
    // input sanitization

    // extended objects must be geo-searched by $geoIntersects, which is only supported on 2dsphere indexes; 
    // therefore, requests for box regions must be coerced into approximately corresponding geodesic-edged polygons.
    let winding=false
    if(box) {
      box = helpers.box_sanitation(box, false, true)[0] // if we're going to search it like a polygon, we dont need to split on the dateline
        if(box.hasOwnProperty('code')){
        // error, return and bail out
        return box
      }

      polygon = JSON.stringify(helpers.box2polygon(box[0], box[1]).coordinates[0])

      // always enforce winding for boxes on extended object searches;
      // 2d searches are always interior to the box, but 2dsphere searches can depend on winding
      // box2polygon always ccw winds, so winding=true preserves interiority
      winding=true
    }

    let params = helpers.parameter_sanitization(extendedName,id,startDate,endDate,polygon,null,winding,center,radius)

    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    params.extended = true // extended objects need a geointersects search instead of geowithin for polygons
    params.batchmeta = batchmeta
    params.compression = compression
    params.metacollection = 'extendedMeta'
    if(data && data.join(',') !== 'except-data-values'){
      params.data_query = helpers.parse_data_qsp(data.join(','))
    }
    params.lookup_meta = false // there's only one AR meta document, just look it up once
    params.genericMeta = true // the sole AR meta doc counts as a generic metadata doc.
    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.polygon, params.center, params.radius, null, false, null, null, params.compression, params.batchmeta) 
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
    if(compression=='minimal'){
      params.projection = ['_id', 'metadata', 'timestamp', 'geolocation']
    }

    // metadata table filter: just get a single metadoc, there's only one for ar objects
    let metafilter = Extended['extendedMeta'].find({_id:'ar'}).exec()
    params.metafilter = false

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, Extended[extendedName], params, local_filter))

    Promise.all([metafilter, datafilter])
        .then(search_result => {
          let stub = function(data){
              // given a data document,
              // return the record that should be returned when the compression=minimal API flag is set
              // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.
              return [
                data['_id'], 
                data['timestamp'],
                data['geolocation'],
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
 * Metadata for extended objects by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findextendedMeta = function(res, id) {
  return new Promise(function(resolve, reject) {
    let match = {
      '_id': id
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = Extended['extendedMeta'].aggregate([{$match:match}]);
    let postprocess = helpers.meta_xform(res)
    res.status(404) // 404 by default
    resolve([query.cursor(), postprocess])  
  })
}
