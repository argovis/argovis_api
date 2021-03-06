'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.findgrid = function findgrid (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, compression, data, presRange, gridName) {
  Grid.findgrid(gridName, id, startDate, endDate, polygon, multipolygon, center, radius, compression, data, presRange)
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

module.exports.findgridMeta = function findgridMeta (req, res, next, id) {
  Grid.findgridMeta(id)
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

module.exports.gridVocab = function gridVocab (req, res, next) {
  Grid.gridVocab()
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
