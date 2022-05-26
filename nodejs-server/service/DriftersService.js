'use strict';
const Drifter = require('../models/drifter');
const helpers = require('./helpers')

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
 * id String Unique drifter ID to search for. (optional)
 * wmo BigDecimal World Meteorological Organization identification number (optional)
 * returns List
 **/
exports.drifterSearch = function(startDate,endDate,polygon,id,wmo) {
  return new Promise(function(resolve, reject) {

    if(id && wmo){
      reject({code:400, message: 'Please filter by at most one of id or wmo.'})
      return
    }

    let metaMatch = {}
    let spacetimeMatch = {}
    let aggPipeline = []

    // construct metadata match
    if(id){
      metaMatch['metadata'] = id
    }

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
    let bailout = helpers.request_sanitation(startDate, endDate, polygon, null, null, null, null, id, wmo) // wmo here is a bit kludgy; at time of writing, that argument was intended as Argo platform number, and the sanitation funciton waves through anything with a unique platform number, which is also appropriate for a unique WMO number, but not strictly semantically correct.
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

    if(wmo){
      let query = Drifter['drifterMeta'].aggregate([{$match: {'WMO': wmo}}])
      query.exec(function (err, driftermeta) {
        if (err){
          reject({"code": 500, "message": "Server error"});
          return;
        }
        let ids = new Set(driftermeta.map(x => x['_id']))

        aggPipeline.push({$match:{'metadata':{$in:Array.from(ids)}}})
        aggPipeline.push({$match: spacetimeMatch})
        aggPipeline.push({$sort: {timestamp:-1}})
        query = Drifter['drifters'].aggregate(aggPipeline);
        query.exec(helpers.queryCallback.bind(null,null, resolve, reject))  
      })
    } else {
      aggPipeline.push({$match: metaMatch})
      aggPipeline.push({$match: spacetimeMatch})
      aggPipeline.push({$sort: {timestamp:-1}})    
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

