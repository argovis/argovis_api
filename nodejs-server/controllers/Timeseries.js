'use strict';

const apihits = require('../models/apihits');
var Timeseries = require('../service/TimeseriesService');
var helpers = require('../helpers/helpers')

module.exports.findtimeseries = function findtimeseries (req, res, next, id, startDate, endDate, polygon, box, center, radius, verticalRange, compression, data, batchmeta, timeseriesName) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, product: timeseriesName, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})
  
  Timeseries.findtimeseries(res, timeseriesName, id, startDate, endDate, polygon, box, center, radius, verticalRange, compression, data, batchmeta)
    .then(
      pipefittings => helpers.data_pipeline.bind(null, req, res, batchmeta)(pipefittings),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.findtimeseriesMeta = function findtimeseriesMeta (req, res, next, id) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Timeseries.findtimeseriesMeta(res, id)
    .then(
      pipefittings => helpers.data_pipeline.bind(null, req, res, false)(pipefittings),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.timeseriesVocab = function timeseriesVocab (req, res, next, parameter, timeseriesName) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, product: timeseriesName, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Timeseries.timeseriesVocab(timeseriesName, parameter)
    .then(
      helpers.simpleWrite.bind(null, req, res),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};
