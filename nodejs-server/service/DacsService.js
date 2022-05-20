'use strict';
const Summary = require('../models/summary');
const helpers = require('./helpers')

/**
 * Provides summary data for each data assembly center.
 *
 * returns List
 **/
exports.dacSummary = function() {
  return new Promise(function(resolve, reject) {

    const query = Summary.find({"_id":"dacs"})
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}


