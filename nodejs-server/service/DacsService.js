'use strict';


/**
 * Provides summary data for each data assembly center.
 *
 * returns List
 **/
exports.dacSummary = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "most_recent_date" : "2000-01-23T04:56:07.000+00:00",
  "dac" : "dac",
  "number_of_profiles" : 0,
  "_id" : "_id"
}, {
  "most_recent_date" : "2000-01-23T04:56:07.000+00:00",
  "dac" : "dac",
  "number_of_profiles" : 0,
  "_id" : "_id"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

