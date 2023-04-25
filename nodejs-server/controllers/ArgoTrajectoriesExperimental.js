'use strict';
const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var ArgoTrajectoriesExperimental = require('../service/ArgoTrajectoriesExperimentalService');
var helpers = require('../helpers/helpers')

module.exports.argotrajectoryVocab = function argotrajectoryVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  ArgoTrajectoriesExperimental.argotrajectoryVocab(parameter)
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

module.exports.findArgoTrajectory = function findArgoTrajectory (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, platform, compression, mostrecent, data) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})

  ArgoTrajectoriesExperimental.findArgoTrajectory(res, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, platform, compression, mostrecent, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgotrajectorymeta = function findArgotrajectorymeta (req, res, next, id, platform) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query})
  
  ArgoTrajectoriesExperimental.findArgotrajectorymeta(res, id, platform)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
