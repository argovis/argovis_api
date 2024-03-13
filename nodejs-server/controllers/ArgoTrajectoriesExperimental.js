'use strict';
const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var ArgoTrajectoriesExperimental = require('../service/ArgoTrajectoriesExperimentalService');
var helpers = require('../helpers/helpers')

module.exports.argotrajectoryVocab = function argotrajectoryVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

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

module.exports.findArgoTrajectory = function findArgoTrajectory (req, res, next, id, startDate, endDate, polygon, multipolygon, box, winding, center, radius, metadata, platform, compression, mostrecent, data, batchmeta) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})

  ArgoTrajectoriesExperimental.findArgoTrajectory(res, id, startDate, endDate, polygon, multipolygon, box, winding, center, radius, metadata, platform, compression, mostrecent, data, batchmeta)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgotrajectorymeta = function findArgotrajectorymeta (req, res, next, id, platform) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu'})
  
  ArgoTrajectoriesExperimental.findArgotrajectorymeta(res, id, platform)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
