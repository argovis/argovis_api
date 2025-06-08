'use strict';

var utils = require('../utils/writer.js');
var Timeseries = require('../service/TimeseriesService');

module.exports.findtimeseries = function findtimeseries (req, res, next, timeseriesName, id, startDate, endDate, polygon, box, center, radius, verticalRange, compression, data, batchmeta) {
  Timeseries.findtimeseries(timeseriesName, id, startDate, endDate, polygon, box, center, radius, verticalRange, compression, data, batchmeta)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findtimeseriesMeta = function findtimeseriesMeta (req, res, next, id) {
  Timeseries.findtimeseriesMeta(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.timeseriesVocab = function timeseriesVocab (req, res, next, timeseriesName, parameter) {
  Timeseries.timeseriesVocab(timeseriesName, parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
