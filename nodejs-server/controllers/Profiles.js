'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ProfilesService');

module.exports.profile = function profile (req, res, next, startDate, endDate, polygon, box, ids, platforms, presRange, coreMeasurements, bgcMeasurements) {
  Profiles.profile(startDate, endDate, polygon, box, ids, platforms, presRange, coreMeasurements, bgcMeasurements)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
