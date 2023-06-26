'use strict';
var utils = require('../utils/writer.js');
var NOAASSTOptimumInterpolationV2Timeseries = require('../service/NOAASSTOptimumInterpolationV2TimeseriesService');
const apihits = require('../models/apihits');
var helpers = require('../helpers/helpers')

module.exports.findNOAASST = function findNOAASST (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, mostrecent, compression, data) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  NOAASSTOptimumInterpolationV2Timeseries.findNOAASST(res, id, startDate, endDate, polygon, multipolygon, winding, center, radius, mostrecent, compression, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findNOAASSTmeta = function findNOAASSTmeta (req, res, next, id) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  NOAASSTOptimumInterpolationV2Timeseries.findNOAASSTmeta(res, id)
   .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};


