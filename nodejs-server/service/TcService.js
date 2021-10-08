'use strict';
const tcTraj = require('../models/tcTraj');
const moment = require('moment');

/**
 * one tropical cyclone instance
 *
 * returns tcSchema
 **/
exports.findOneTC = function() {
  return new Promise(function(resolve, reject) {
    const query = tcTraj.findOne()
    query.exec(function (err, tcTraj) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }
        if (tcTraj == null){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        resolve(tcTraj);
    })
  });
}

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
    query.exec(function (err, tcTraj) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }
        if(tcTraj.length == 0){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        resolve(tcTraj.map(function(el) { return el._id }));
    })
  });
}


/**
 * tropical cyclones at a given date-time
 *
 * date Date date-time formatted string
 * returns List
 **/
exports.findTCbyDate = function(date) {
  return new Promise(function(resolve, reject) {
    const query = tcTraj.find({startDate: {$lte: date}, endDate: {$gte: date}});
    query.exec(function (err, tcTraj) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }
        if(tcTraj.length == 0){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        resolve(tcTraj);
    })
  });
}

/**
 * tropical cyclones intersecting a time period
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * returns List
 **/
exports.findTCbyDateRange = function(startDate,endDate) {
  return new Promise(function(resolve, reject) {
    // limit to 3 months worth of cyclones per request
    const sDate = moment(startDate, 'YYYY-MM-DDTHH:mm:ss')
    const eDate = moment(endDate, 'YYYY-MM-DDTHH:mm:ss')
    const dateDiff = eDate.diff(sDate)
    const monthDiff = Math.floor(moment.duration(dateDiff).asMonths())
    if (monthDiff > 3) {
        reject({"code": 400, "message": "Query timespan exceeds 3 months; please search for a smaller period."})
        return;
    }

    const query = tcTraj.find({$or: [
          {$and: [ {startDate: {$lte: startDate}}, {endDate: {$gte: endDate} }] },    // cyclone completely within timespan
          {$and: [ {endDate: {$gte: startDate}}, {endDate: {$lte: endDate} }] },      // cyclone ends during timespan
          {$and: [ {startDate: {$gte: startDate}}, {startDate: {$lte: endDate} }] }   // cyclone begins during timespan
        ]}
      );

    query.exec(function (err, tcTraj) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }
        if(tcTraj.length == 0){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        resolve(tcTraj);
    })
  });
}

/**
 * find a tropical cyclone by name and year
 *
 * name String name of tropical cyclone
 * year BigDecimal year of tropical cyclone
 * returns List
 **/
exports.findTCbyNameYear = function(name,year) {
  return new Promise(function(resolve, reject) {
    const tc_name = name.toUpperCase()

    const query = tcTraj.find({name: tc_name, year: year})
    query.exec(function (err, tcTraj) {
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }
        if(tcTraj.length == 0){
            reject({"code": 404, "message": "Not found: No matching results found in database."});
            return;
        }
        resolve(tcTraj);
    })
  });
}

