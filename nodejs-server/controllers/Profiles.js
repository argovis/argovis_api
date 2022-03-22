'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ProfilesService');

module.exports.profile = function profile (req, res, next, startDate, endDate, polygon, box, center, radius, id, platform, presRange, dac, source, woceline, datavars, compression, data) {
  Profiles.profile(startDate, endDate, polygon, box, center, radius, id, platform, presRange, dac, source, woceline, datavars, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.profileList = function profileList (req, res, next, startDate, endDate, polygon, box, center, radius, dac, source, woceline, datavars, platform, presRange, data) {
  Profiles.profileList(startDate, endDate, polygon, box, center, radius, dac, source, woceline, datavars, platform, presRange, data)
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
