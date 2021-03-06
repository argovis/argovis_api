'use strict';

var utils = require('../utils/writer.js');
var Covar = require('../service/CovarService');

module.exports.findCovar = function findCovar (req, res, next, lat, lon, forcastDays) {
  Covar.findCovar(lat, lon, forcastDays)
    .then(function (response) {
      utils.writeJson(res, response, 200);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.sumCovar = function sumCovar (req, res, next, lat, lon, forcastDays, polygon) {
  Covar.sumCovar(lat, lon, forcastDays, polygon)
    .then(function (response) {
      utils.writeJson(res, response, 200);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
