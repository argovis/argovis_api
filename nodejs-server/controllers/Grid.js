'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.findOHC = function findOHC (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, compression, data) {
  Grid.findOHC(id, startDate, endDate, polygon, multipolygon, center, radius, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findOHCmeta = function findOHCmeta (req, res, next) {
  Grid.findOHCmeta()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.gridVocab = function gridVocab (req, res, next, parameter) {
  Grid.gridVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.gridselect = function gridselect (req, res, next, gridName, presRange, polygon, multipolygon, startDate, endDate) {
  Grid.gridselect(gridName, presRange, polygon, multipolygon, startDate, endDate)
    .then(function (response) {
      utils.writeJson(res, response);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
