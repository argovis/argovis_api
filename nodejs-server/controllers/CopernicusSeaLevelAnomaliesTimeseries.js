'use strict';

var utils = require('../utils/writer.js');
var CopernicusSeaLevelAnomaliesTimeseries = require('../service/CopernicusSeaLevelAnomaliesTimeseriesService');

module.exports.copernicusslaVocab = function copernicusslaVocab (req, res, next, parameter) {
  CopernicusSeaLevelAnomaliesTimeseries.copernicusslaVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCopernicusSLA = function findCopernicusSLA (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, mostrecent, compression, data) {
  CopernicusSeaLevelAnomaliesTimeseries.findCopernicusSLA(id, startDate, endDate, polygon, multipolygon, winding, center, radius, mostrecent, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCopernicusSLAmeta = function findCopernicusSLAmeta (req, res, next, id) {
  CopernicusSeaLevelAnomaliesTimeseries.findCopernicusSLAmeta(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
