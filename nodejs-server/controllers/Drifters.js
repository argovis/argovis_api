'use strict';
const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var Drifters = require('../service/DriftersService');
var helpers = require('../helpers/helpers')

module.exports.drifterMetaSearch = function drifterMetaSearch (req, res, next, id, platform, wmo) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

  Drifters.drifterMetaSearch(res,id,platform, wmo)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.drifterSearch = function drifterSearch (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, wmo, platform, compression, mostrecent, data, batchmeta) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

  Drifters.drifterSearch(res,id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, wmo, platform, compression, mostrecent, data, batchmeta)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.drifterVocab = function drifterVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})
  
  Drifters.drifterVocab(parameter)
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
