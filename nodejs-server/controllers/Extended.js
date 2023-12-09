'use strict';

const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var Extended = require('../service/ExtendedService');
var helpers = require('../helpers/helpers')

module.exports.extendedVocab = function extendedVocab (req, res, next, extendedName) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, product: timeseriesName, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})
  
  Extended.extendedVocab(extendedName)
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

module.exports.findExtended = function findExtended (req, res, next, extendedName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, batchmeta) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, product: extendedName, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

  Extended.findExtended(res, extendedName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, batchmeta)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findextendedMeta = function findextendedMeta (req, res, next, id) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

  Extended.findextendedMeta(res, id)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

