'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.griddedProductsGridWindowGET = function griddedProductsGridWindowGET (req, res, next, gridName, presLevel, latRange, lonRange, date) {
  Grid.griddedProductsGridWindowGET(gridName, presLevel, latRange, lonRange, date)
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
