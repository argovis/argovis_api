'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');


module.exports.gridselect = function gridselect (req, res, next, gridName, polygon, startDate, endDate, presRange) {
  Grid.gridselect(gridName, polygon, startDate, endDate, presRange)
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
