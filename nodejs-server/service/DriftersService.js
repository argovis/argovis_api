'use strict';
const Drifter = require('../models/drifter');
const helpers = require('./helpers');
const geojsonArea = require('@mapbox/geojson-area');

/**
 * Search, reduce and download drifter metadata.
 *
 * id String Unique drifter ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterMetaSearch = function(id,wmo) {
  return new Promise(function(resolve, reject) {

    let metaMatch = {}

    if(id){
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
 * id String Unique drifter ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * compression String Data compression strategy to apply. (optional)
 * returns List
 **/
exports.drifterSearch = function(startDate,endDate,polygon,multipolygon,id,wmo,compression) {
  return new Promise(function(resolve, reject) {

    if(id && wmo){
      reject({code:400, message: 'Please filter by at most one of id or wmo.'})
      return
    }

    let spacetimeMatch = {}
    let aggPipeline = []

    // spacetime match
    /// spacetime sanitation
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
    let bailout = helpers.request_sanitation(startDate, endDate, polygon, null, null, null, multipolygon, id||wmo) 
    if(bailout){
      //request looks huge or malformed, reject it
      reject(bailout)
      return
    }
    /// spacetime agg stage construction
    if (startDate && endDate){
      spacetimeMatch['timestamp'] = {$gte: startDate, $lte: endDate}
    } else if (startDate){
      spacetimeMatch['timestamp'] = {$gte: startDate}
    } else if (endDate){
      spacetimeMatch['timestamp'] = {$lte: endDate}
    }
    if(polygon) {
      spacetimeMatch['geolocation'] = {$geoWithin: {$geometry: polygon}}
    }
    if(multipolygon){
      multipolygon.sort((a,b)=>{geojsonArea.geometry(a) - geojsonArea.geometry(b)}) // smallest first to minimize size of unindexed geo search
      spacetimeMatch['geolocation'] = {$geoWithin: {$geometry: multipolygon[0]}}
    }
    aggPipeline.push({$match: spacetimeMatch})
    // zoom in on subsequent polygon regions; will be unindexed.
    if(multipolygon && multipolygon.length > 1){
      for(let i=1; i<multipolygon.length; i++){
        aggPipeline.push( {$match: {"geolocation": {$geoWithin: {$geometry: multipolygon[i]}}}} )
      }
    }
    aggPipeline.push({$sort: {timestamp:-1}})

    // construct metadata search, and prefix to aggregation pipeline; wmo requires a table cross reference. $lookup is an option, but this is faster:
    if(wmo){
      let query = Drifter['drifterMeta'].aggregate([{$match: {'WMO': wmo}}])
      query.exec(function (err, driftermeta) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        let ids = new Set(driftermeta.map(x => x['_id']))

        aggPipeline.unshift({$match:{'metadata':{$in:Array.from(ids)}}}) 
        query = Drifter['drifters'].aggregate(aggPipeline);
        query.exec(helpers.queryCallback.bind(null,null, resolve, reject)) 
      })
    } else if(id) {
      aggPipeline.unshift({$match: {'metadata': id}})
      let query = Drifter['drifters'].aggregate(aggPipeline);
      query.exec(helpers.queryCallback.bind(null,null, resolve, reject)) 
    } else {
      let query = Drifter['drifters'].aggregate(aggPipeline);
      query.exec(helpers.queryCallback.bind(null,null, resolve, reject)) 
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
    else if(parameter == 'id') key = '_id'

    Drifter['drifterMeta'].find().distinct(key, function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      resolve(vocab)
    })
  });
}

