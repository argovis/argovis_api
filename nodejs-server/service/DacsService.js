'use strict';


/**
 * Provides summary data for each data assembly center.
 *
 * returns summary
 **/
exports.dacSummary = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "summary" : { },
  "_id" : "_id"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

