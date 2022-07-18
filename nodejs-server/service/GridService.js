'use strict';
const Grid = require('../models/grid');
const helpers = require('./helpers')
const GJV = require('geojson-validation');
const geojsonArea = require('@mapbox/geojson-area');

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
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * presRange List Pressure range in dbar to filter for; levels outside this range will not be returned. (optional)
 * returns List
 **/
exports.findgrid = function(gridName,id,startDate,endDate,polygon,multipolygon,center,radius,compression,data,presRange) {
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
    let datafilter = metafilter.then(helpers.datatable_match.bind(null, Grid[gridName], params, local_filter))

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

  });
}


