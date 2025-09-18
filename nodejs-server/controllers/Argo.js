'use strict';
const apihits = require('../models/apihits');
var Profiles = require('../service/ArgoService');
var helpers = require('../helpers/helpers')

module.exports.argoBGC = function argoBGC (req, res, next) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})
  
  Profiles.argoBGC()
    .then(
      helpers.simpleWrite.bind(null, req, res),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.argoDACs = function argoDACs (req, res, next) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Profiles.argoDACs()
    .then(
      helpers.simpleWrite.bind(null, req, res),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.argoOverview = function argoOverview (req, res, next) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Profiles.argoOverview()
    .then(
      helpers.simpleWrite.bind(null, req, res),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.argoVocab = function argoVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Profiles.argoVocab(parameter)
    .then(
      helpers.simpleWrite.bind(null, req, res),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.bapVocab = function bapVocab (req, res, next, parameter) {
    apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

    Profiles.bapVocab(parameter)
      .then(
        helpers.simpleWrite.bind(null, req, res),
        helpers.lookupReject.bind(null, req, res)
      )
      .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.findArgo = function findArgo (req, res, next, id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, source, compression, data, presRange, verticalRange, batchmeta) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Profiles.findArgo(res, id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, source, compression, data, presRange, verticalRange, batchmeta)
    .then(
      pipefittings => helpers.data_pipeline.bind(null, req, res, batchmeta)(pipefittings),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.findArgometa = function findArgometa (req, res, next, id, platform) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})
  
  Profiles.findArgometa(res, id, platform)
    .then(
      pipefittings => helpers.data_pipeline.bind(null, req, res, false)(pipefittings),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.findBAP = function findBAP (req, res, next, id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, compression, presRange, verticalRange, batchmeta) {
    apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

    Profiles.findBAP(res, id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, source, compression, data, presRange, verticalRange, batchmeta)
      .then(
        pipefittings => helpers.data_pipeline.bind(null, req, res, batchmeta)(pipefittings),
        helpers.lookupReject.bind(null, req, res)
      )
      .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.findBAPmeta = function findBAPmeta (req, res, next, id, platform) {
    apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})
  
    Profiles.findBAPmeta(res, id, platform)
      .then(
        pipefittings => helpers.data_pipeline.bind(null, req, res, false)(pipefittings),
        helpers.lookupReject.bind(null, req, res)
      )
      .catch(helpers.catchPipeline.bind(null, req, res));
};
