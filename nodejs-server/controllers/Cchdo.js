'use strict';
const apihits = require('../models/apihits');
var Profiles = require('../service/CchdoService');
var helpers = require('../helpers/helpers')

module.exports.findCCHDO = function findCCHDO (req, res, next, id, startDate, endDate, polygon, box, center, radius, metadata, woceline, expocode, cchdo_cruise, source, compression, data, presRange, verticalRange, batchmeta) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Profiles.findCCHDO(res, id, startDate, endDate, polygon, box, center, radius, metadata, woceline, expocode, cchdo_cruise, source, compression, data, presRange, verticalRange, batchmeta)
    .then(
      pipefittings => helpers.data_pipeline.bind(null, req, res, batchmeta)(pipefittings),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.findCCHDOmeta = function findCCHDOmeta (req, res, next, id, woceline, expocode, cchdo_cruise) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Profiles.findCCHDOmeta(res, id, woceline, expocode, cchdo_cruise)
    .then(
      pipefittings => helpers.data_pipeline.bind(null, req, res, false)(pipefittings),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.cchdoVocab = function cchdoVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})
  
  Profiles.cchdoVocab(parameter)
    .then(
      helpers.simpleWrite.bind(null, req, res),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};
