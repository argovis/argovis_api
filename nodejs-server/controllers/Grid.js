'use strict';
const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');
var helpers = require('../helpers/helpers')

module.exports.findgrid = function findgrid (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, data, presRange, gridName) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, product: gridName})

  Grid.findgrid(res,gridName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, data, presRange)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findgridMeta = function findgridMeta (req, res, next, id) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Grid.findgridMeta(res,id)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.gridVocab = function gridVocab (req, res, next, gridName) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, product: gridName})
  
  Grid.gridVocab(gridName)
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
