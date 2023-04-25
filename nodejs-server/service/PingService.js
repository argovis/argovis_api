'use strict';


/**
 * Dummy endpoint for liveness checks
 *
 * returns String
 **/
exports.ping = function() {
  return new Promise(function(resolve, reject) {
      resolve('OK')
      return
  });
}

