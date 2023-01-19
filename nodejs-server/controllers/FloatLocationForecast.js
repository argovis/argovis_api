'use strict';

var utils = require('../utils/writer.js');
var FloatLocationForecast = require('../service/FloatLocationForecastService');
var helpers = require('../helpers/helpers')

module.exports.findfloatLocationForecast = function findfloatLocationForecast (req, res, next, id, forecastOrigin, forecastGeolocation, metadata, compression, data) {
  FloatLocationForecast.findfloatLocationForecast(res, id, forecastOrigin, forecastGeolocation, metadata, compression, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findfloatLocationForecastMeta = function findfloatLocationForecastMeta (req, res, next, id) {
  FloatLocationForecast.findfloatLocationForecastMeta(res,id)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};