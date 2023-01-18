'use strict';

var utils = require('../utils/writer.js');
var CovarExperimental = require('../service/CovarExperimentalService');
var helpers = require('../helpers/helpers')
var Grid = require('../service/GridService');

module.exports.findCovar = function findCovar (req, res, next, lat, lon, forcastDays) {
  CovarExperimental.findCovar(lat, lon, forcastDays)
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

module.exports.findCovariance = function findCovariance (req, res, next, id, forecastOrigin, forecastGeolocation, metadata, compression, data) {
  CovarExperimental.findCovariance(res, id, forecastOrigin, forecastGeolocation, metadata, compression, data)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCovariancerMeta = function findCovariancerMeta (req, res, next, id) {
  CovarExperimental.findCovariancerMeta(res,id)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

// module.exports.findCovariancerMeta = function findgridMeta (req, res, next, id) {
//   console.log(9000)
//   Grid.findgridMeta(res,id)
//     .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
//     function (response) {
//       console.log('success', response)
//       utils.writeJson(res, response, response.code);
//     })
//     .catch(function (response) {
//       console.log('failure', response)
//       utils.writeJson(res, response);
//     });
// };

module.exports.sumCovar = function sumCovar (req, res, next, lat, lon, forcastDays, polygon) {
  CovarExperimental.sumCovar(lat, lon, forcastDays, polygon)
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
