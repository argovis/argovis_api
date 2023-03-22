'use strict';
const helpers = require('../helpers/helpers')
const userModel = require('../models/user');

/**
 * validate an API token
 *
 * token String token to validate
 * returns Object
 **/
exports.validateToken = function(res, token) {
  return new Promise(function(resolve, reject){

    let match = {
        'key': token
    }

    const query = userModel.aggregate([{$match:match}]);
    let postprocess = helpers.token_xform(res)
    res.status(404)
    resolve([query.cursor(), postprocess])
  });
}