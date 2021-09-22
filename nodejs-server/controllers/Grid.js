'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.gridmeta = function gridmeta (req, res, next, gridName) {
  Grid.gridmeta(gridName)
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
