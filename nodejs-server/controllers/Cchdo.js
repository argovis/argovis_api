'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/CchdoService');
var helpers = require('../helpers/helpers')

module.exports.findCCHDO = function findCCHDO (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, woceline, cchdo_cruise, source, compression, mostrecent, data, presRange) {
  Profiles.findCCHDO(res, id, startDate, endDate, polygon, multipolygon, center, radius, woceline, cchdo_cruise, source, compression, mostrecent, data, presRange)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCCHDOmeta = function findCCHDOmeta (req, res, next, id, woceline, cchdo_cruise) {
  Profiles.findCCHDOmeta(res, id, woceline, cchdo_cruise)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.cchdoVocab = function cchdoVocab (req, res, next, parameter) {
  Profiles.cchdoVocab(parameter)
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
