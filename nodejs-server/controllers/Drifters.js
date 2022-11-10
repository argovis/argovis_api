'use strict';

var utils = require('../utils/writer.js');
var Drifters = require('../service/DriftersService');
var helpers = require('../helpers/helpers')

module.exports.drifterMetaSearch = function drifterMetaSearch (req, res, next, id, platform, wmo) {
  Drifters.drifterMetaSearch(res,id,platform, wmo)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.drifterSearch = function drifterSearch (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, metadata, wmo, platform, compression, mostrecent, data) {
  Drifters.drifterSearch(res,id, startDate, endDate, polygon, multipolygon, center, radius, metadata, wmo, platform, compression, mostrecent, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.drifterVocab = function drifterVocab (req, res, next, parameter) {
  Drifters.drifterVocab(parameter)
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
