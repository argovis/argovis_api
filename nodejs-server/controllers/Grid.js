'use strict';
const apihits = require('../models/apihits');
var Grid = require('../service/GridService');
var helpers = require('../helpers/helpers')

module.exports.findgrid = function findgrid (req, res, next, id, startDate, endDate, polygon, box, center, radius, compression, data, presRange, verticalRange, batchmeta, gridName) {
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, product: gridName, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})
  
  // redirect kg21 -> localGPspace
  if (gridName === 'kg21') {
    gridName = 'localGPspace';
  }
  if (data){
      data = data.map(x => x.replaceAll("kg21","localGPspace"));
  }
  
  Grid.findgrid(res,gridName, id, startDate, endDate, polygon, box, center, radius, compression, data, presRange, verticalRange, batchmeta)
    .then(
      pipefittings => helpers.data_pipeline.bind(null, req, res, batchmeta)(pipefittings),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.findgridMeta = function findgridMeta (req, res, next, id) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  // redirect kg21 -> localGPspace
  if (id === 'kg21_ohc15to300') {
    id = 'localGPspace_ohc15to300';
  }

  Grid.findgridMeta(res,id)
    .then(
      pipefittings => helpers.data_pipeline.bind(null, req, res, false)(pipefittings),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};

module.exports.gridVocab = function gridVocab (req, res, next, parameter, gridName) {
  
  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, product: gridName, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})
  
  // redirect kg21 -> localGPspace
  if (gridName === 'kg21') {
    gridName = 'localGPspace';
  }

  Grid.gridVocab(gridName, parameter)
    .then(
      helpers.simpleWrite.bind(null, req, res),
      helpers.lookupReject.bind(null, req, res)
    )
    .catch(helpers.catchPipeline.bind(null, req, res));
};
