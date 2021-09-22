'use strict';
const Grid = require('../models/grid');


const datePresGrouping = {_id: '$gridName', presLevels: {$addToSet: '$pres'}, dates: {$addToSet: '$date'}}

/**
 * metadata from grid unique dates, pres levels
 *
 * gridName String name of the gridded product
 * returns GridMeta
 **/
exports.gridmeta = function(gridName) {
  return new Promise(function(resolve, reject) {
    const GridModel = Grid.get_grid_model(gridName);
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
    console.log('agg executed')
  });
}

