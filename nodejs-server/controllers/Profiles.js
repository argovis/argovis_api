'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ProfilesService');

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
