'use strict';
const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var Profiles = require('../service/CchdoService');
var helpers = require('../helpers/helpers')

module.exports.findCCHDO = function findCCHDO (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, woceline, cchdo_cruise, source, compression, mostrecent, data, presRange) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Profiles.findCCHDO(res, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, woceline, cchdo_cruise, source, compression, mostrecent, data, presRange)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCCHDOmeta = function findCCHDOmeta (req, res, next, id, woceline, cchdo_cruise) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Profiles.findCCHDOmeta(res, id, woceline, cchdo_cruise)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.cchdoVocab = function cchdoVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})
  
  Profiles.cchdoVocab(parameter)
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
