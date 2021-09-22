'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.griddedProductsGridCoordsGET = function griddedProductsGridCoordsGET (req, res, next, gridName, latRange, lonRange) {
  Grid.griddedProductsGridCoordsGET(gridName, latRange, lonRange)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.gridmeta = function gridmeta (req, res, next, gridName) {
  Grid.gridmeta(gridName)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.nonuniformGridWindow = function nonuniformGridWindow (req, res, next, gridName, presLevel, latRange, lonRange, date) {
  Grid.nonuniformGridWindow(gridName, presLevel, latRange, lonRange, date)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.uniformGridWindow = function uniformGridWindow (req, res, next, gridName, presLevel, latRange, lonRange, date) {
  Grid.uniformGridWindow(gridName, presLevel, latRange, lonRange, date)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
