'use strict';
const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var Token = require('../service/TokenService');
var helpers = require('../helpers/helpers')

module.exports.validateToken = function validateToken (req, res, next, token) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})
  
  Token.validateToken(res, token)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
