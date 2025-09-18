'use strict';

var utils = require('../utils/writer.js');
var Argo = require('../service/ArgoService');

module.exports.argoBGC = function argoBGC (req, res, next) {
  Argo.argoBGC()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoDACs = function argoDACs (req, res, next) {
  Argo.argoDACs()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoOverview = function argoOverview (req, res, next) {
  Argo.argoOverview()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoVocab = function argoVocab (req, res, next, parameter) {
  Argo.argoVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.bapVocab = function bapVocab (req, res, next, parameter) {
  Argo.bapVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgo = function findArgo (req, res, next, id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, source, compression, data, presRange, verticalRange, batchmeta) {
  Argo.findArgo(id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, source, compression, data, presRange, verticalRange, batchmeta)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgometa = function findArgometa (req, res, next, id, platform) {
  Argo.findArgometa(id, platform)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findBAP = function findBAP (req, res, next, id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, compression, data, presRange, verticalRange, batchmeta) {
  Argo.findBAP(id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, compression, data, presRange, verticalRange, batchmeta)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findBAPmeta = function findBAPmeta (req, res, next, id, platform) {
  Argo.findBAPmeta(id, platform)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
