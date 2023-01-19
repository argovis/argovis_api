'use strict';

var utils = require('../utils/writer.js');
var FloatLocationForecast = require('../service/FloatLocationForecastService');

module.exports.findfloatLocationForecast = function findfloatLocationForecast (req, res, next, id, forecastOrigin, forecastGeolocation, metadata, compression, data) {
  FloatLocationForecast.findfloatLocationForecast(id, forecastOrigin, forecastGeolocation, metadata, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findfloatLocationForecastMeta = function findfloatLocationForecastMeta (req, res, next, id) {
  FloatLocationForecast.findfloatLocationForecastMeta(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
