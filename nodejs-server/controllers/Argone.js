'use strict';

var utils = require('../utils/writer.js');
var Argone = require('../service/ArgoneService');

module.exports.findargone = function findargone (req, res, next, id, forecastOrigin, forecastGeolocation, metadata, compression, data) {
  Argone.findargone(id, forecastOrigin, forecastGeolocation, metadata, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findargoneMeta = function findargoneMeta (req, res, next, id) {
  Argone.findargoneMeta(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
