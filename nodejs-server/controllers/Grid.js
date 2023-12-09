'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.findgrid = function findgrid (req, res, next, gridName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, data, presRange, batchmeta) {
  Grid.findgrid(gridName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent, data, presRange, batchmeta)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findgridMeta = function findgridMeta (req, res, next, id) {
  Grid.findgridMeta(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.gridVocab = function gridVocab (req, res, next, gridName) {
  Grid.gridVocab(gridName)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
