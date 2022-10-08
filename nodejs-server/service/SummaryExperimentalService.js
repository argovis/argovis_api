'use strict';


/**
 * Fetch a document from the summary collection by ID.
 *
 * id String Unique ID to search for. (optional)
 * returns Object
 **/
exports.fetchSummary = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = { };
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

