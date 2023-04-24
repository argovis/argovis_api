'use strict';
const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var Profiles = require('../service/ArgoService');
var helpers = require('../helpers/helpers')

module.exports.argoBGC = function argoBGC (req, res, next) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Profiles.argoBGC()
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

module.exports.argoDACs = function argoDACs (req, res, next) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Profiles.argoDACs()
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

module.exports.argoOverview = function argoOverview (req, res, next) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Profiles.argoOverview()
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

module.exports.argoVocab = function argoVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Profiles.argoVocab(parameter)
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

module.exports.findArgo = function findArgo (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, platform, platform_type, source, compression, mostrecent, data, presRange) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  Profiles.findArgo(res, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, platform, platform_type, source, compression, mostrecent, data, presRange)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgometa = function findArgometa (req, res, next, id, platform) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})
  
  Profiles.findArgometa(res, id, platform)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
