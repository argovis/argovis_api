'use strict';
const summaries = require('../models/summary');
const helpers = require('../helpers/helpers')

/**
 * Fetch a document from the summary collection by ID.
 *
 * id String Unique ID to search for. (optional)
 * returns Object
 **/
exports.fetchSummary = function(id) {
  return new Promise(function(resolve, reject) {
    const query = summaries.find({"_id":id}).lean()
    query.exec(helpers.queryCallback.bind(null,null, resolve, reject))
  });
}