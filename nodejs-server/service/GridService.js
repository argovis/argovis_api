'use strict';
const Grid = require('../models/grid');
const helpers = require('./helpers')
const GJV = require('geojson-validation');
const geojsonArea = require('@mapbox/geojson-area');
const datePresGrouping = {_id: '$gridName', presLevels: {$addToSet: '$pres'}, dates: {$addToSet: '$date'}}

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

        let bailout = helpers.request_sanitation(startDate, endDate, polygon, null, null, null, multipolygon, null, null)
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


