'use strict';
const Grid = require('../models/grid');
const GridParameter = Grid.ksTempParams;
const moment = require('moment');
const helpers = require('./helpers')
const GJV = require('geojson-validation');

const datePresGrouping = {_id: '$gridName', presLevels: {$addToSet: '$pres'}, dates: {$addToSet: '$date'}}

/**
=======
 * gridded product selector
 *
 * gridName String name of the gridded product
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point
 * startDate Date date-time formatted string indicating the beginning of a time period
 * endDate Date date-time formatted string indicating the end of a time period
 * presRange List Pressure range (optional)
 * returns List
 **/
exports.gridselect = function(gridName,polygon,startDate,endDate,presRange) {
  return new Promise(function(resolve, reject) {

    // sanitation
    try {
      polygon = JSON.parse(polygon);
    } catch (e) {
      return {"code": 400, "message": "Polygon region wasn't proper JSON; format should be [[lon,lat],[lon,lat],...]"};
    }
    if(!helpers.validlonlat(polygon)){
      return {"code": 400, "message": "All lon, lat pairs must respect -180<=lon<=180 and -90<=lat<-90"}; 
    }
    polygon = {
      "type": "Polygon",
      "coordinates": [polygon]
    }
    if(!GJV.valid(polygon)){
      return {"code": 400, "message": "Polygon region wasn't proper geoJSON; format should be [[lon,lat],[lon,lat],...]"};
    }

    let agg = []
    date = new Date(date)
    agg.push({$match: {"t": {$gte: startDate, $lte: endDate},  "g": {$geoWithin: {$geometry: polygon}}}})

    const query = Grid.grid.aggregate(agg)
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}
