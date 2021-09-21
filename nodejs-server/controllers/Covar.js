'use strict';

var utils = require('../utils/writer.js');
var Covar = require('../service/CovarService');

module.exports.findCovar = function findCovar (req, res, next, lat, lon, forcastDays) {
  Covar.findCovar(lat, lon, forcastDays)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
