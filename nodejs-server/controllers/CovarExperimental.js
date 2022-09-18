'use strict';

var utils = require('../utils/writer.js');
var CovarExperimental = require('../service/CovarExperimentalService');

module.exports.findCovar = function findCovar (req, res, next, lat, lon, forcastDays) {
  CovarExperimental.findCovar(lat, lon, forcastDays)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.sumCovar = function sumCovar (req, res, next, lat, lon, forcastDays, polygon) {
  CovarExperimental.sumCovar(lat, lon, forcastDays, polygon)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
