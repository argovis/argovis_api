'use strict';

var utils = require('../utils/writer.js');
var CopernicusSeaLevelAnomaliesTimeseries = require('../service/CopernicusSeaLevelAnomaliesTimeseriesService');

module.exports.findCopernicusSLA = function findCopernicusSLA (req, res, next, id, polygon, multipolygon, winding, center, radius, mostrecent, compression, data) {
  CopernicusSeaLevelAnomaliesTimeseries.findCopernicusSLA(id, polygon, multipolygon, winding, center, radius, mostrecent, compression, data)
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
