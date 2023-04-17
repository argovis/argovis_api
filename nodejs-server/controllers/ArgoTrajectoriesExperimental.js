'use strict';

var utils = require('../utils/writer.js');
var ArgoTrajectoriesExperimental = require('../service/ArgoTrajectoriesExperimentalService');
var helpers = require('../helpers/helpers')

module.exports.argotrajectoryVocab = function argotrajectoryVocab (req, res, next, parameter) {
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
  ArgoTrajectoriesExperimental.findArgotrajectorymeta(res, id, platform)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
