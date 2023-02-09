'use strict';

var utils = require('../utils/writer.js');
var Argone = require('../service/ArgoneService');
var helpers = require('../helpers/helpers')

module.exports.findargone = function findargone (req, res, next, id, forecastOrigin, forecastGeolocation, metadata, compression, data) {
  Argone.findargone(res, id, forecastOrigin, forecastGeolocation, metadata, compression, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findargoneMeta = function findargoneMeta (req, res, next, id) {
  Argone.findargoneMeta(res, id)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};