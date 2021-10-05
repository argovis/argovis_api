'use strict';


/**
 * Provides a summary of platforms.
 *
 * returns platformStub
 **/
exports.platformList = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "cycle_number" : 5,
  "most_recent_date" : "2000-01-23T04:56:07.000+00:00",
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "dac" : "dac",
  "platform_number" : 6.027456183070403,
  "number_of_profiles" : 1,
  "_id" : 0.8008281904610115
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

