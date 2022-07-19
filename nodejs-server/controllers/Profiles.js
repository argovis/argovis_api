'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ProfilesService');

module.exports.findGoship = function findGoship (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, woceline, compression, data, presRange) {
  Profiles.findGoship(id, startDate, endDate, polygon, multipolygon, center, radius, woceline, compression, data, presRange)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findGoshipmeta = function findGoshipmeta (req, res, next, id, woceline) {
  Profiles.findGoshipmeta(id, woceline)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.goshipVocab = function goshipVocab (req, res, next, parameter) {
  Profiles.goshipVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.profile = function profile (req, res, next, startDate, endDate, polygon, box, center, radius, multipolygon, id, platform, presRange, dac, source, woceline, compression, data) {
  Profiles.profile(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform, presRange, dac, source, woceline, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.profileList = function profileList (req, res, next, startDate, endDate, polygon, box, center, radius, multipolygon, dac, source, woceline, platform, presRange, data) {
  Profiles.profileList(startDate, endDate, polygon, box, center, radius, multipolygon, dac, source, woceline, platform, presRange, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.profileVocab = function profileVocab (req, res, next, parameter) {
  Profiles.profileVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.profilesOverview = function profilesOverview (req, res, next) {
  Profiles.profilesOverview()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
