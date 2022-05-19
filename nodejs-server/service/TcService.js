'use strict';
const tcTraj = require('../models/tcTraj');
const moment = require('moment');
const helpers = require('./helpers')

/**
 * returns a list of tropical cyclone names and years
 *
 * returns List
 **/
exports.findStormNameList = function() {
  return new Promise(function(resolve, reject) {

    const TRAJ_GROUP = { _id: '$stormName'}    
    const TRAJ_PROJ = { 
                        _id: 1,
                        name: 1,
                        year: 1,
                        stormName: 1,
                      }

    let agg = [ {$addFields: {
                    stormName: {
                            $concat: [
                                '$name', '-',
                                {$toString: '$year'}
                            ]
                    }
                }},
                {$match: {stormName: {$exists: true, $ne: null}}},
                {$group: TRAJ_GROUP},
                {$project: TRAJ_PROJ}

              ]
    const query = tcTraj.aggregate(agg)
    let postprocess = function(data) {
        return data.map(function(d) { return d._id })
    }
    query.exec(helpers.queryCallback.bind(null,postprocess, resolve, reject))
  });
}


/**
 * Tropical cyclone search and filter.
 *
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * name String name of tropical cyclone (optional)
 * year BigDecimal year of tropical cyclone (optional)
 * returns List
 **/
exports.findTC = function(startDate,endDate,name,year) {
  return new Promise(function(resolve, reject) {
    if((name || year) && (startDate || endDate)){
        reject({"code": 400, "message": "Please search for TC by providing startDate and endDate, OR name and year."});
        return;
    }
    if((name && !year) || (year && !name)){
        reject({"code": 400, "message": "Please provide both name and year, not just one."});
        return;
    }
    if((startDate && !endDate) || (endDate && !startDate)){
        reject({"code": 400, "message": "Please provide both startDate and endDate, no more than 3 months apart."});
        return;
    }

    let filter = {}
    if(name && year){
        const tc_name = name.toUpperCase()
        filter = {name: tc_name, year: year}
    } else if (startDate && endDate){
        const sDate = moment(startDate, 'YYYY-MM-DDTHH:mm:ss')
        const eDate = moment(endDate, 'YYYY-MM-DDTHH:mm:ss')
        const dateDiff = eDate.diff(sDate)
        const monthDiff = Math.floor(moment.duration(dateDiff).asMonths())
        if (monthDiff > 3) {
            reject({"code": 400, "message": "Query timespan exceeds 3 months; please search for a smaller period."})
            return;
        }
        filter = {$or: [
          {$and: [ {startDate: {$lte: startDate}}, {endDate: {$gte: endDate} }] },    // cyclone completely within timespan
          {$and: [ {endDate: {$gte: startDate}}, {endDate: {$lte: endDate} }] },      // cyclone ends during timespan
          {$and: [ {startDate: {$gte: startDate}}, {startDate: {$lte: endDate} }] }   // cyclone begins during timespan
        ]}
    }

    const query = tcTraj.find(filter)

    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}
