'use strict';
const Profile = require('../models/profile');

/**
 * Search, reduce and download profile data.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period
 * endDate Date date-time formatted string indicating the end of a time period
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * ids List List of profile IDs (optional)
 * platforms List List of platform IDs (optional)
 * presRange List Pressure range (optional)
 * coreMeasurements List Keys of core measurements to include (optional)
 * bgcMeasurements List Keys of BGC measurements to include (optional)
 * returns Profile
 **/
exports.profile = function(startDate,endDate,polygon,box,ids,platforms,presRange,coreMeasurements,bgcMeasurements) {
  return new Promise(function(resolve, reject) {

    startDate = new Date(startDate);
    endDate = new Date(endDate);
    if ((endDate - startDate)/3600000/24 > 90) reject({"code": 400, "message": "Please request <= 90 days of data at a time."});

    let aggPipeline = [{$match:  {date: {$lte: endDate, $gte: startDate}}}];

    if (ids){
      aggPipeline.push({$match: {_id: { $in: ids}}})
    }

    if(platforms) {
      aggPipeline.push({$match: {platform_number: { $in: platforms}}})
    }

    if(polygon) {
      console.log(polygon)
    }

    if(box) {
      console.log(box)
    }

    if(presRange) {
      console.log(presRange)
    }

    if(coreMeasurements) {
      console.log(coreMeasurements)
    }

    if(bgcMeasurements) {
      console.log.bgcMeasurements
    }

    const query = Profile.aggregate(aggPipeline);

    query.exec(function (err, profiles) {
      if (err) reject({"code": 500, "message": "Server error"});
      if(profiles.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
      resolve(profiles);
    })
  }
)}


