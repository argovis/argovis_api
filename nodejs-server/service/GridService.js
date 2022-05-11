'use strict';
const Grid = require('../models/grid');
const helpers = require('./helpers')
const GJV = require('geojson-validation');
const geojsonArea = require('@mapbox/geojson-area');

const datePresGrouping = {_id: '$gridName', presLevels: {$addToSet: '$pres'}, dates: {$addToSet: '$date'}}

/**
 * gridded product selector
 *
 * gridName String name of the gridded product
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point
 * startDate Date date-time formatted string indicating the beginning of a time period
 * endDate Date date-time formatted string indicating the end of a time period
 * presRange List Pressure range (optional)
 * returns List
 **/
exports.gridselect = function(gridName,presRange,polygon,multipolygon,startDate,endDate) {
  return new Promise(function(resolve, reject) {

    if(gridName && (typeof polygon == 'undefined' && typeof startDate == 'undefined' && typeof endDate == 'undefined' && typeof presRange == 'undefined')){
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

        if(typeof polygon == 'undefined' || typeof startDate == 'undefined' || typeof endDate == 'undefined'){
            reject({"code": 400, "message": "Query string parameters gridName, polygon, startDate, and endDate are all required unless you are making a metadata-only request, in which case only gridName should be provided." }); 
        }

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        if(!(gridName in Grid)){
          reject({"code": 400, "message": gridName + " is not a supported grid; instead try one of: " + Object.getOwnPropertyNames(Grid)});  
        }

        try {
          polygon = JSON.parse(polygon);
        } catch (e) {
          reject({"code": 400, "message": "Polygon region wasn't proper JSON; format should be [[lon,lat],[lon,lat],...]"});
        }
        if(!helpers.validlonlat(polygon)){
          reject({"code": 400, "message": "All lon, lat pairs must respect -180<=lon<=180 and -90<=lat<-90"}); 
        }
        polygon = {
          "type": "Polygon",
          "coordinates": [polygon]
        }
        if(!GJV.valid(polygon)){
          reject({"code": 400, "message": "Polygon region wasn't proper geoJSON; format should be [[lon,lat],[lon,lat],...]"});
        }
        if(geojsonArea.geometry(polygon) > 2000000000000){
          return {"code": 400, "message": "Polygon region is too big; please ask for 1.5 M square km or less in a single request, or about 10 square degrees at the equator."}
        }

        Promise.all([
            Grid[gridName].aggregate([{$match: {"g": {$geoWithin: {$geometry: polygon}}, "t": {$gte: startDate, $lte: endDate} }}]),
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


