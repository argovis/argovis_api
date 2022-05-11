'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.gridselect = function gridselect (req, res, next, gridName, presRange, polygon, multipolygon, startDate, endDate) {
  Grid.gridselect(gridName, presRange, polygon, multipolygon, startDate, endDate)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
