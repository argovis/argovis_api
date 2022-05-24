'use strict';

var utils = require('../utils/writer.js');
var Drifters = require('../service/DriftersService');

module.exports.drifterSearch = function drifterSearch (req, res, next, startDate, endDate, polygon, id, wmo) {
  Drifters.drifterSearch(startDate, endDate, polygon, id, wmo)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.drifterSearch_1 = function drifterSearch_1 (req, res, next, id, wmo) {
  Drifters.drifterSearch_1(id, wmo)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
