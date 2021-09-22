'use strict';
const Grid = require('../models/grid');
const moment = require('moment');


const datePresGrouping = {_id: '$gridName', presLevels: {$addToSet: '$pres'}, dates: {$addToSet: '$date'}}

/**
 * coordinates for gridded product
 *
 * gridName String name of the gridded product
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * returns GridCoordSchema
 **/
exports.gridCoords = function(gridName,latRange,lonRange) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "gridName" : "gridName",
  "lats" : [ 0.8008281904610115, 0.8008281904610115 ],
  "lons" : [ 6.027456183070403, 6.027456183070403 ],
  "_id" : "_id"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * metadata from grid unique dates, pres levels
 *
 * gridName String name of the gridded product
 * returns GridMeta
 **/
exports.gridmeta = function(gridName) {
  return new Promise(function(resolve, reject) {
    const GridModel = Grid.get_grid_model(gridName);
    if(GridModel == null) reject({"code": 400, "message": "No valid grid named " + gridName});
    const query = GridModel.aggregate( [
        {$match: {gridName: gridName}},
        {$group: datePresGrouping},
        {$unwind: "$presLevels"},
        {$sort: {presLevels: 1}},
        {$group: {_id: null, "presLevels": {$push: "$presLevels"}, dates: {$first: '$dates'}}},
        {$unwind: "$dates"},
        {$sort: {dates: 1}},
        {$group: {_id: null, "dates": {$push: "$dates"}, minDate: {$min: '$dates'}, maxDate: {$max: '$dates'}, presLevels: {$first: '$presLevels'}}},
    ])
    query.exec(function (err, gridmeta) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(gridmeta.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(gridmeta);
    })
  });
}


/**
 * non uniformly spaced rectangular gridded product
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * date date YYYY-MM-DD format. Monthly grids use the first day of the month.
 * returns GridSchema
 **/
exports.nonuniformGridWindow = function(gridName,presLevel,latRange,lonRange,date) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "gridName" : "gridName",
  "data" : [ {
    "lon" : 6.027456183070403,
    "value" : 1.4658129805029452,
    "lat" : 0.8008281904610115
  }, {
    "lon" : 6.027456183070403,
    "value" : 1.4658129805029452,
    "lat" : 0.8008281904610115
  } ],
  "pres" : 5.962133916683182,
  "trend" : "trend",
  "chunk" : 5,
  "units" : "units",
  "NODATA_value" : 7.061401241503109,
  "cellSize" : 2.3021358869347655,
  "measurement" : "measurement",
  "param" : "param",
  "variable" : "variable",
  "model" : "model",
  "_id" : "_id"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * uniformly spaced rectangular gridded product selector
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * date date YYYY-MM-DD format. Monthly grids use the first day of the month.
 * returns RasterGrid
 **/
exports.uniformGridWindow = function(gridName,presLevel,latRange,lonRange,date) {
  return new Promise(function(resolve, reject) {
    const GridModel = Grid.get_grid_model(gridName)
    if(GridModel == null) reject({"code": 400, "message": "No valid grid named " + gridName});
    let agg = []
    agg.push({$match: {pres: presLevel, date: date, gridName: gridName }})
    agg = add_grid_projection(agg, latRange, lonRange)
    const query = GridModel.aggregate(agg)
    query.exec(function (err, uniformGridWindow) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(uniformGridWindow.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(uniformGridWindow);
    })
  });
}

// helpers ///////////////////////////////////////////////////////////////

const add_grid_projection = function(agg, latRange, lonRange) {

    const proj =  [{$project: { // query for lat lng ranges
            pres: -1,
            date: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
            variable: -1,
            cellsize: -1,
            NODATA_value: -1,
            chunk: -1,
            data: {
                $filter: {
                    input: '$data',
                    as: 'item',
                    cond: {
                        $and: [
                            {$gt: ['$$item.lat', latRange[0]]},
                            {$lt: ['$$item.lat', latRange[1]]},
                            {$gt: ['$$item.lon', lonRange[0]]},
                            {$lt: ['$$item.lon', lonRange[1]]}
                        ]},
                },
            },
        }},
        { $unwind : '$data' }, //allows sorting
        {$sort:  {'data.lat': -1, 'data.lon': 1}}, //TODO check indexes. it may already be sorted....
        {$group: {_id: '$_id', //collection for nrows and ncolumns
                        'pres': {$first: '$pres'},
                        'date': {$first: '$date'},
                        'measurement': {$first: '$measurement'},
                        'units': {$first: '$units'},
                        'param': {$first: '$param'},
                        'variable': {$first: '$variable'},
                        'cellXSize': {$first: '$cellsize'},
                        'cellYSize': {$first: '$cellsize'},
                        'noDataValue': {$first: '$NODATA_value'},
                        'gridName': {$first: '$gridName'},
                        'lons': { $addToSet: "$data.lon" },
                        'lats': { $addToSet: "$data.lat"},
                        'zs': {$push : "$data.value" // values should be in sorted order
                                },
            }
        },
        {$project: {
            pres: -1,
            date: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
            variable: -1,
            cellXSize: -1,
            cellYSize: -1,
            noDataValue: -1,
            nRows: { $size: '$lats'},
            nCols: { $size: '$lons'},
            xllCorner: { $min: '$lons'},
            yllCorner: { $min: '$lats'},
            zs: 1,
            },
        }]

    agg = agg.concat(proj)
    return agg
}