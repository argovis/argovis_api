'use strict';

var utils = require('../utils/writer.js');
var Tc = require('../service/TcService');
var helpers = require('../helpers/helpers')

module.exports.findTC = function findTC (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, name, compression, data) {
  Tc.findTC(res, id, startDate, endDate, polygon, multipolygon, center, radius, name, compression, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findTCmeta = function findTCmeta (req, res, next, id, name) {
  Tc.findTCmeta(res,id,name)
   .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tcVocab = function tcVocab (req, res, next, parameter) {
  Tc.tcVocab(parameter)
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
