'use strict';
const Drifter = require('../models/drifter');
const helpers = require('./helpers');
const geojsonArea = require('@mapbox/geojson-area');

const inflateDrifters = function(data){
  // given an array of drifter data records,
  // replace the data key in the data records with an object keyed by variable name.

  let dk = ["ve", "vn", "err_lon", "err_lat", "err_ve", "err_vn", "gap", "sst", "sst1", "sst2", "err_sst", "err_sst1", "err_sst2", "flg_sst", "flg_sst1", "flg_sst2"]

  for(let i=0; i<data.length; i++){
    let d = {}
    for(let j=0; j<data[i].data[0].length; j++){
      d[dk[j]] = data[i].data[0][j]
    }
    data[i].data[0] = d
  }

  return data
}

/**
 * Search, reduce and download drifter metadata.
 *
 * platform String Unique platform ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterMetaSearch = function(platform,wmo) {
  return new Promise(function(resolve, reject) {

    let metaMatch = {}

    if(platform){
      metaMatch['_id'] = id
    }

    if(wmo){
      metaMatch['WMO'] = wmo
    }

    let query = Drifter['drifterMeta'].aggregate([{$match: metaMatch}])
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))

  });
}


/**
 * Search, reduce and download drifter data.
 *
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * platform String Unique platform ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * id String ID of individual drifter measurement, formatted [platform_id]_[measurement number starting from 0] (optional)
 * compression String Data compression strategy to apply. (optional)
 * returns List
 **/
exports.drifterSearch = function(startDate,endDate,polygon,multipolygon,center,radius,platform,wmo,id,compression) {
  return new Promise(function(resolve, reject) {

    let spacetimeMatch = []
    let proxMatch = []
    let metadataMatch = []
    let foreignMatch = []
    let aggPipeline = []

    // input sanitation & parsing
    if(startDate){
      startDate = new Date(startDate);
    }
    if(endDate){
      endDate = new Date(endDate);
    }
    if(polygon){
      polygon = helpers.polygon_sanitation(polygon)

      if(polygon.hasOwnProperty('code')){
        // error, return and bail out
        reject(polygon)
        return
      }
    }
    if(multipolygon){
      try {
        multipolygon = JSON.parse(multipolygon);
      } catch (e) {
        reject({"code": 400, "message": "Multipolygon region wasn't proper JSON; format should be [[first polygon], [second polygon]], where each polygon is [lon,lat],[lon,lat],..."});
        return
      }
      multipolygon = multipolygon.map(function(x){return helpers.polygon_sanitation(JSON.stringify(x))})
      if(multipolygon.some(p => p.hasOwnProperty('code'))){
        multipolygon = multipolygon.filter(x=>x.hasOwnProperty('code'))
        reject(multipolygon[0])
        return
      } 
    }
    let bailout = helpers.request_sanitation(startDate, endDate, polygon, null, center, radius, multipolygon, platform||wmo||id) 
    if(bailout){
      //request looks huge or malformed, reject it
      reject(bailout)
      return
    }

    // construct match stages as required
    /// prox match construction
    if(center && radius) {
      proxMatch.push({$geoNear: {key: 'geolocation', near: {type: "Point", coordinates: [center[0], center[1]]}, maxDistance: 1000*radius, distanceField: "distcalculated"}}) 
      proxMatch.push({ $unset: "distcalculated" })
    }

    /// spacetime match construction
    if(startDate || endDate || polygon || multipolygon){
      spacetimeMatch[0] = {$match: {}}
      if (startDate && endDate){
        spacetimeMatch[0]['$match']['timestamp'] = {$gte: startDate, $lte: endDate}
      } else if (startDate){
        spacetimeMatch[0]['$match']['timestamp'] = {$gte: startDate}
      } else if (endDate){
        spacetimeMatch[0]['$match']['timestamp'] = {$lte: endDate}
      }
      if(polygon) {
        spacetimeMatch[0]['$match']['geolocation'] = {$geoWithin: {$geometry: polygon}}
      }
      if(multipolygon){
        multipolygon.sort((a,b)=>{geojsonArea.geometry(a) - geojsonArea.geometry(b)}) // smallest first to minimize size of unindexed geo search
        spacetimeMatch[0]['$match']['geolocation'] = {$geoWithin: {$geometry: multipolygon[0]}}
      }
      // zoom in on subsequent polygon regions; will be unindexed.
      if(multipolygon && multipolygon.length > 1){
        for(let i=1; i<multipolygon.length; i++){
          spacetimeMatch.push( {$match: {"geolocation": {$geoWithin: {$geometry: multipolygon[i]}}}} )
        }
      }
      spacetimeMatch.push({$sort: {timestamp:-1}})
    }

    /// metadata match contruction
    if(platform || id){
      metadataMatch[0] = {$match: {'metadata': platform, '_id': id}}
    }

    /// foreign table match construction
    if(wmo){
      foreignMatch[0] = {$match: {'WMO': wmo}}
    }

    if(foreignMatch.length > 0){ // want to leverage indexes of both collections; index search the foreign table first, and use the result to construct a pipeline stage for the main table, which can be inserted as optimal.
      let query = Drifter['drifterMeta'].aggregate(foreignMatch)
      query.exec(function (err, driftermeta) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        let platforms = new Set(driftermeta.map(x => x['_id']))

        aggPipeline = aggPipeline.concat(proxMatch) // mongo requires this to come first if present
        aggPipeline = aggPipeline.concat(metadataMatch)
        aggPipeline.push({$match:{'metadata':{$in:Array.from(platforms)}}})
        aggPipeline = aggPipeline.concat(spacetimeMatch)

        query = Drifter['drifters'].aggregate(aggPipeline);
        if(compression){
          query.exec(helpers.queryCallback.bind(null,null,resolve, reject)) 
        } else {
          query.exec(helpers.queryCallback.bind(null,inflateDrifters, resolve, reject)) 
        }
      })      
    } else {
        aggPipeline = aggPipeline.concat(proxMatch) // mongo requires this to come first if present
        aggPipeline = aggPipeline.concat(metadataMatch)
        aggPipeline = aggPipeline.concat(spacetimeMatch)

        let query = Drifter['drifters'].aggregate(aggPipeline);
        if(compression){
          query.exec(helpers.queryCallback.bind(null,null,resolve, reject)) 
        } else {
          query.exec(helpers.queryCallback.bind(null,inflateDrifters, resolve, reject)) 
        }
    }
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
    let key = ''
    if(parameter == 'wmo') key = 'WMO'
    else if(parameter == 'platform') key = '_id'

    Drifter['drifterMeta'].find().distinct(key, function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      resolve(vocab)
    })
  });
}

