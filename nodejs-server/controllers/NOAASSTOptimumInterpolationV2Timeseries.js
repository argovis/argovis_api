'use strict';

var utils = require('../utils/writer.js');
var NOAASSTOptimumInterpolationV2Timeseries = require('../service/NOAASSTOptimumInterpolationV2TimeseriesService');

module.exports.findNOAASST = function findNOAASST (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, mostrecent, compression, data) {
  NOAASSTOptimumInterpolationV2Timeseries.findNOAASST(id, startDate, endDate, polygon, multipolygon, winding, center, radius, mostrecent, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findNOAASSTmeta = function findNOAASSTmeta (req, res, next, id) {
  NOAASSTOptimumInterpolationV2Timeseries.findNOAASSTmeta(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.noaasstVocab = function noaasstVocab (req, res, next, parameter) {
  NOAASSTOptimumInterpolationV2Timeseries.noaasstVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
