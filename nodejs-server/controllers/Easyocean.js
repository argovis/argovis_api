'use strict';
const apihits = require('../models/apihits');
var helpers = require('../helpers/helpers')
var utils = require('../utils/writer.js');
var Easyocean = require('../service/EasyoceanService');

module.exports.easyoceanVocab = function easyoceanVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

  Easyocean.easyoceanVocab(parameter)
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

module.exports.findeasyocean = function findeasyocean (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, woceline, compression, mostrecent, data, presRange, batchmeta, section_start_date) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

  Easyocean.findeasyocean(res, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, woceline, compression, mostrecent, data, presRange, batchmeta, section_start_date)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findeasyoceanmeta = function findeasyoceanmeta (req, res, next, woceline) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

  Easyocean.findeasyoceanmeta(res, woceline)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
