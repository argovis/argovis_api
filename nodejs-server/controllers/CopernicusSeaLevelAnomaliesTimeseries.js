'use strict';

var utils = require('../utils/writer.js');
var CopernicusSeaLevelAnomaliesTimeseries = require('../service/CopernicusSeaLevelAnomaliesTimeseriesService');
const apihits = require('../models/apihits');
var helpers = require('../helpers/helpers')

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

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  CopernicusSeaLevelAnomaliesTimeseries.findCopernicusSLA(res, id, startDate, endDate, polygon, multipolygon, winding, center, radius, mostrecent, compression, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCopernicusSLAmeta = function findCopernicusSLAmeta (req, res, next, id) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  CopernicusSeaLevelAnomaliesTimeseries.findCopernicusSLAmeta(res, id)
   .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
