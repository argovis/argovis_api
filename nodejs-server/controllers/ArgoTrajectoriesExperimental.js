'use strict';

var utils = require('../utils/writer.js');
var ArgoTrajectoriesExperimental = require('../service/ArgoTrajectoriesExperimentalService');

module.exports.argotrajectoryVocab = function argotrajectoryVocab (req, res, next, parameter) {
  ArgoTrajectoriesExperimental.argotrajectoryVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgoTrajectory = function findArgoTrajectory (req, res, next, id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, platform, compression, mostrecent, data, batchmeta) {
  ArgoTrajectoriesExperimental.findArgoTrajectory(id, startDate, endDate, polygon, multipolygon, winding, center, radius, metadata, platform, compression, mostrecent, data, batchmeta)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgotrajectorymeta = function findArgotrajectorymeta (req, res, next, id, platform) {
  ArgoTrajectoriesExperimental.findArgotrajectorymeta(id, platform)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
