'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ProfilesService');

module.exports.argoBGC = function argoBGC (req, res, next) {
  Profiles.argoBGC()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoDACs = function argoDACs (req, res, next) {
  Profiles.argoDACs()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoOverview = function argoOverview (req, res, next) {
  Profiles.argoOverview()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoVocab = function argoVocab (req, res, next, parameter) {
  Profiles.argoVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.cchdoVocab = function cchdoVocab (req, res, next, parameter) {
  Profiles.cchdoVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgo = function findArgo (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, platform, source, compression, mostrecent, data, presRange) {
  Profiles.findArgo(id, startDate, endDate, polygon, multipolygon, center, radius, platform, source, compression, mostrecent, data, presRange)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgometa = function findArgometa (req, res, next, id, platform) {
  Profiles.findArgometa(id, platform)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCCHDO = function findCCHDO (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, woceline, cchdo_cruise, source, compression, mostrecent, data, presRange) {
  Profiles.findCCHDO(id, startDate, endDate, polygon, multipolygon, center, radius, woceline, cchdo_cruise, source, compression, mostrecent, data, presRange)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCCHDOmeta = function findCCHDOmeta (req, res, next, id, woceline, cchdo_cruise) {
  Profiles.findCCHDOmeta(id, woceline, cchdo_cruise)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
