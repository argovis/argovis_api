'use strict';
const Grid = require('../models/grid');
const helpers = require('./helpers')
const GJV = require('geojson-validation');
const geojsonArea = require('@mapbox/geojson-area');
const datePresGrouping = {_id: '$gridName', presLevels: {$addToSet: '$pres'}, dates: {$addToSet: '$date'}}

const findGrid = function(model, id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange, resolve, reject){
  // generic helper for all grid search and filter routes

  // input sanitization
  let params = helpers.parameter_sanitization(id,startDate,endDate,polygon,multipolygon,center,radius)
  if(params.hasOwnProperty('code')){
    // error, return and bail out
    reject(params)
    return
  }

  // decide y/n whether to service this request
  let bailout = helpers.request_sanitation(params.startDate, params.endDate, params.polygon, null, params.center, params.radius, params.multipolygon, id) 
  if(bailout){
    //request looks huge or malformed, reject it
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
      presRange: presRange
  }

  // metadata table filter: no-op promise if nothing to filter metadata for, custom search otherwise
  /// currently no explicit metadata parameters to start search on for grid, but leaving the boilerplate in anyway...
  let metafilter = Promise.resolve(null)
  let metacomplete = false
  // if(name){
  //     metafilter = tc['tcMeta'].aggregate([{$match: {'name': name}}]).exec()
  //     metacomplete = true
  // }

  // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
  let datafilter = metafilter.then(helpers.datatable_match.bind(null, model, params, local_filter))

  // if no metafilter search was performed, need to look up metadata for anything that matched datafilter
  let metalookup = Promise.resolve(null)
  if(!metacomplete){
      metalookup = datafilter.then(helpers.meta_lookup.bind(null, Grid['gridMeta']))
  }

  // send both metafilter and datafilter results to postprocessing:
  Promise.all([metafilter, datafilter, metalookup])
      .then(search_result => {return helpers.postprocess(pp_params, search_result)})
      .then(result => resolve(result))
      .catch(err => reject({"code": 500, "message": "Server error"}))
}

/**
 * Search and filter for an ocean heat content grid, https://doi.org/10.5281/ZENODO.6131625.
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * returns List
 **/
exports.findOHC = function(id,startDate,endDate,polygon,multipolygon,center,radius,compression,data) {
  return new Promise(findGrid.bind(null, Grid['ohc_kg'],id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,null));
}


/**
 * OHC metadata search and filter.
 *
 * returns List
 **/
exports.findOHCmeta = function() {
  return new Promise(function(resolve, reject) {
    const query = Grid.gridMeta.aggregate([{$match:{'_id':'ohc_kg'}}]);
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * Search and filter for Roemmich-Gilson total (anomaly + mean) salinity grid
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findRGpaslTotal = function(id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange) {
  return new Promise(findGrid.bind(null, Grid['salinity_rg'],id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange));
}


/**
 * Metadata for RG total salinity grid
 *
 * returns List
 **/
exports.findRGpsalTotalMeta = function() {
  return new Promise(function(resolve, reject) {
    const query = Grid.gridMeta.aggregate([{$match:{'_id':'salinity_rg'}}]);
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * Search and filter for Roemmich-Gilson total (anomaly + mean) temperature grid
 *
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data compression strategy to apply. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findRGtempTotal = function(id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange) {
  return new Promise(findGrid.bind(null, Grid['temperature_rg'],id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange));
}


/**
 * Metadata for RG total temperature grid
 *
 * returns List
 **/
exports.findRGtempTotalMeta = function() {
  return new Promise(function(resolve, reject) {
    const query = Grid.gridMeta.aggregate([{$match:{'_id':'temperature_rg'}}]);
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


/**
 * List all possible values for certain grid query string parameters
 *
 * parameter String /grids query string parameter to summarize possible values of.
 * returns List
 **/
exports.gridVocab = function(parameter) {
  return new Promise(function(resolve, reject) {

    let key = ''
    if(parameter == 'gridName') key = '_id'

    Grid['grids-meta'].find().distinct(key, function (err, vocab) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      resolve(vocab)
    })

  });
}


/**
 * gridded product selector
 *
 * gridName String name of the gridded product to query.
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * multipolygon String array of polygon regions; region of interest is taken as the intersection of all listed polygons. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * returns List
 **/
exports.gridselect = function(gridName,presRange,polygon,multipolygon,startDate,endDate) {
  return new Promise(function(resolve, reject) {

    if(gridName && (typeof polygon == 'undefined' && typeof startDate == 'undefined' && typeof endDate == 'undefined' && typeof presRange == 'undefined' && typeof multipolygon == 'undefined')){
        // metadata only request
        const query = Grid['grids-meta'].aggregate([{$match:{"_id": gridName}}]);

        query.exec(function (err, meta) {
          if (err){
            reject({"code": 500, "message": "Server error"});
            return;
          }

          if(meta.length == 0) {
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
          }

          resolve(meta[0]);
        })
    } else {
        // regular data request
        // sanitation
        if((typeof polygon == 'undefined' && typeof multipolygon == 'undefined') || typeof startDate == 'undefined' || typeof endDate == 'undefined'){
          reject({"code": 400, "message": "Query string parameters gridName, startDate, endDate, and one of polygon or multipolygon are all required unless you are making a metadata-only request, in which case only gridName should be provided." }); 
        }
        if(!(gridName in Grid)){
          reject({"code": 400, "message": gridName + " is not a supported grid; instead try one of: " + Object.getOwnPropertyNames(Grid)});  
        }

        // parse inputs
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

        let bailout = helpers.request_sanitation(startDate, endDate, polygon, null, null, null, multipolygon, null)
        if(bailout){
          //request looks huge, reject it
          reject(bailout)
          return
        }

        let spacetimeMatch = []
        if(polygon) {
          spacetimeMatch = [{$match: {"g": {$geoWithin: {$geometry: polygon}}, "t": {$gte: startDate, $lte: endDate} }}]
        }

        if(multipolygon){
          multipolygon.sort((a,b)=>{geojsonArea.geometry(a) - geojsonArea.geometry(b)}) // smallest first to minimize size of unindexed geo search

          spacetimeMatch = [{$match: {"g": {$geoWithin: {$geometry: multipolygon[0]}}, "t": {$gte: startDate, $lte: endDate} }}]
          for(let i=1; i<multipolygon.length; i++){
            spacetimeMatch.push({$match: {"g": {$geoWithin: {$geometry: multipolygon[i]}}}})
          }
        }

        Promise.all([
            Grid[gridName].aggregate(spacetimeMatch),
            Grid['grids-meta'].aggregate([{$match:{"_id": gridName}}])
        ]).then( ([ grids, gridmeta]) => {

            if(presRange){
                for(let i=0; i<grids.length; i++){
                    grids[i]['d'] = grids[i]['d'].filter((e,i) => gridmeta[0]['levels'][i]>presRange[0] && gridmeta[0]['levels'][i]<presRange[1])
                }
                gridmeta[0]['levels'] = gridmeta[0]['levels'].filter(x => x>presRange[0] && x<presRange[1])
            }
            grids.unshift(gridmeta[0])
            resolve(grids);
        }).catch(error => {
            reject({"code": 500, "message": "Server error"});
            return;
        });
    }   
  });
}


