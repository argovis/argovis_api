'use strict';
const apihits = require('../models/apihits');
var helpers = require('../helpers/helpers')
var utils = require('../utils/writer.js');
var SummaryExperimental = require('../service/SummaryExperimentalService');

module.exports.fetchSummary = function fetchSummary (req, res, next, id) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})
  
  SummaryExperimental.fetchSummary(id)
    .then(function (response) {
      utils.writeJson(res, response);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};