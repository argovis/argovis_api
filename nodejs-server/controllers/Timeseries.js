'use strict';

var utils = require('../utils/writer.js');
var Timeseries = require('../service/TimeseriesService');

module.exports.findtimeseries = function findtimeseries (req, res, next, timeseriesName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, data, batchmeta) {
  Timeseries.findtimeseries(timeseriesName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, data, batchmeta)
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

module.exports.timeseriesVocab = function timeseriesVocab (req, res, next, timeseriesName) {
  Timeseries.timeseriesVocab(timeseriesName)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
