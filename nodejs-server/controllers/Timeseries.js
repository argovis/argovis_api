'use strict';

const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var Timeseries = require('../service/TimeseriesService');
var helpers = require('../helpers/helpers')

module.exports.findtimeseries = function findtimeseries (req, res, next, timeseriesName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, data) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Timeseries.findtimeseries(res, timeseriesName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findtimeseriesMeta = function findtimeseriesMeta (req, res, next, id) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Timeseries.findtimeseriesMeta(res, id)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.timeseriesVocab = function timeseriesVocab (req, res, next, timeseriesName) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Timeseries.timeseriesVocab(timeseriesName)
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
