'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ProfilesService');

module.exports.profile = function profile (req, res, next, startDate, endDate, polygon, box, center, radius, id, platforms, presRange, dac, source, woceline, datakey, compression, data) {
  Profiles.profile(startDate, endDate, polygon, box, center, radius, id, platforms, presRange, dac, source, woceline, datakey, compression, data)
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

module.exports.profileList = function profileList (req, res, next, startDate, endDate, polygon, box, center, radius, dac, source, woceline, datakey, platforms, presRange, data) {
  Profiles.profileList(startDate, endDate, polygon, box, center, radius, dac, source, woceline, datakey, platforms, presRange, data)
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

module.exports.profilesOverview = function profilesOverview (req, res, next) {
  Profiles.profilesOverview()
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
