'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ProfilesService');

module.exports.profile = function profile (req, res, next, startDate, endDate, polygon, box, center, radius, ids, platforms, presRange, dac, source, compression, data) {
  Profiles.profile(startDate, endDate, polygon, box, center, radius, ids, platforms, presRange, dac, source, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.profileList = function profileList (req, res, next, startDate, endDate, polygon, box, center, radius, dac, source, platforms, presRange, data) {
  Profiles.profileList(startDate, endDate, polygon, box, center, radius, dac, source, platforms, presRange, data)
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
