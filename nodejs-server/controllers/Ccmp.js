'use strict';

var utils = require('../utils/writer.js');
var Ccmp = require('../service/CcmpService');
var helpers = require('../helpers/helpers')

module.exports.ccmpMetaSearch = function ccmpMetaSearch (req, res, next, id) {
  Ccmp.ccmpMetaSearch(res, id)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.ccmpSearch = function ccmpSearch (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, metadata, compression, mostrecent, data) {
  Ccmp.ccmpSearch(res, id, startDate, endDate, polygon, multipolygon, center, radius, metadata, compression, mostrecent, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.ccmpVocab = function ccmpVocab (req, res, next, parameter) {
  Ccmp.ccmpVocab(parameter)
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


