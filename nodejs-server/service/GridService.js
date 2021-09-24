'use strict';
const Grid = require('../models/grid');
const moment = require('moment');


const datePresGrouping = {_id: '$gridName', presLevels: {$addToSet: '$pres'}, dates: {$addToSet: '$date'}}

/**
 * returns a single grid by name
 *
 * gridName String name of the gridded product
 * returns GridSchema
 **/
exports.findGrid = function(gridName) {
  return new Promise(function(resolve, reject) {
    const GridModel = Grid.get_grid_model(gridName)
    if(GridModel == null) reject({"code": 400, "message": "No valid grid named " + gridName});
    const query = GridModel.aggregate([
        {$match: {gridName: gridName}},
        {$limit: 1}
    ])
    query.exec(function (err, grid) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(grid.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(grid);
    })
  });
}


/**
 * grid parameter search
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * param String tbd
 * returns GridSchema
 **/
exports.findGridParam = function(gridName,presLevel,param) {
  return new Promise(function(resolve, reject) {
    const query = GridParameter.find({pres: presLevel, gridName: gridName, param: param}, {model: 1, param:1, measurement: 1, trend: 1, pres: 1});
    query.limit(1)
    query.exec(function (err, gridparam) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(gridparam.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(gridparam);
    })
  });
}


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

    let agg = [
        {$match: {gridName: gridName}},
        {$unwind: "$lats"},
        {$match: {lats: { $gte: latRange[0], $lte: latRange[1] }}},
        {$group: {_id: null, gridName: {$first: "$gridName"}, lons: {$first: "$lons"}, lats: {$push: "$lats" }}},
        {$unwind: "$lons"},
        {$match: {lons: { $gte: lonRange[0], $lte: lonRange[1] }}},
        {$group: {_id: null, gridName: {$first: "$gridName"}, lons: {$push: "$lons"}, lats: {$first: "$lats" }}},
    ]
    const query = Grid.grid_coords.aggregate(agg)
    query.exec(function (err, gridcoords) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(gridcoords.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(gridcoords);
    })
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
 * date Date date-time formatted string
 * returns nonUniformGrid
 **/
exports.nonuniformGridWindow = function(gridName,presLevel,latRange,lonRange,date) {
  return new Promise(function(resolve, reject) {
    const GridModel = Grid.get_grid_model(gridName)
    if(GridModel == null) reject({"code": 400, "message": "No valid grid named " + gridName});
    let agg = []
    date = new Date(date)
    agg.push({$match: {pres: presLevel, date: date, gridName: gridName }})
    const proj =  {$project: { // query for lat lng ranges
            pres: -1,
            date: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
            variable: -1,
            NODATA_value: -1,
            chunk: -1,
            cellsize: -1,
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
        }}
    agg.push(proj)

    const count_proj = {$project: { // count data lengths
            pres: -1,
            date: -1,
            gridName: -1,
            measurement: -1,
            units: -1,
            param: -1,
            variable: -1,
            NODATA_value: -1,
            chunk: -1,
            cellsize: -1,
            data: -1,
            count: { $size:'$data' },
        }}

    agg.push(count_proj) //filter out empty data. ensures data chunks are recorded 
    agg.push({$match: {count: {$gt: 0}}})
    
    
    const group = {$group: {_id: '$gridName', //collection for nrows and ncolumns
                'pres': {$first: '$pres'},
                'chunks': {$addToSet: "$chunk"},
                'measurement': {$first: '$measurement'},
                'param': {$first: '$param'},
                'date': {$first: '$date'},
                'units': {$first: '$units'},
                'NODATA_value': {$first: '$NODATA_value'},
                'variable': {$first: '$variable'},
                'gridName': {$first: '$gridName'},
                'cellsize': {$first: '$cellsize'},
                'data': {$push : "$data" // values should be in sorted order
                },
        }
    }
    
    agg.push(group)

    const reduce_proj = {$project: {
        pres: -1,
        date: -1,
        gridName: -1,
        measurement: -1,
        units: -1,
        param: -1,
        variable: -1,
        NODATA_value: -1,
        chunks: -1,
        cellsize: -1,
        data: {
            $reduce: {
                input: '$data',
                initialValue: [],
                in: { $concatArrays: [ "$$value", "$$this" ]}
            }
        }
    }
    }
    agg.push(reduce_proj)
    const query = GridModel.aggregate(agg)
    query.exec(function (err, griddata) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(griddata.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(griddata);
    })
  });
}


/**
 * uniformly spaced rectangular gridded product selector
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * date Date date-time formatted string
 * returns RasterGrid
 **/
exports.uniformGridWindow = function(gridName,presLevel,latRange,lonRange,date) {
  return new Promise(function(resolve, reject) {
    const GridModel = Grid.get_grid_model(gridName)
    if(GridModel == null) reject({"code": 400, "message": "No valid grid named " + gridName});
    let agg = []
    date = new Date(date)
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

/**
 * tbd
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * param String tbd
 * returns GridSchema
 **/
exports.windowGridParam = function(gridName,presLevel,latRange,lonRange,param) {
  return new Promise(function(resolve, reject) {
    let agg = []
    agg.push({$match: {pres: presLevel, gridName: gridName, param: param}})
    agg = add_param_projection(agg, latRange, lonRange)
    const query = GridParameter.aggregate(agg);
    query.exec(function (err, gridparam) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(gridparam.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(gridparam);
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

const add_param_projection = function(agg, latRange, lonRange) {
    const proj = [{$project: { // query for lat lng ranges
        pres: -1,
        cellsize: -1,
        NODATA_value: -1,
        gridName: -1,
        measurement: -1,
        units: -1,
        param: -1,
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
    {$sort:  {'data.lat': -1, 'data.lon': 1}},
    {$group: {_id: '$_id', //collection for nrows and ncolumns
                'pres': {$first: '$pres'},
                'measurement': {$first: '$measurement'},
                'param': {$first: '$param'},
                'units': {$first: '$units'},
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
        cellXSize: -1,
        cellYSize: -1,
        noDataValue: -1,
        gridName: -1,
        measurement: -1,
        param: -1,
        units: -1,
        nRows: { $size: '$lats'},
        nCols: { $size: '$lons'},
        xllCorner: { $min: '$lons'},
        yllCorner: { $min: '$lats'},
        zs: 1,
        },
    }
    ]

    agg = agg.concat(proj)
    return agg
}