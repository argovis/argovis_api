'use strict';

var utils = require('../utils/writer.js');
var Drifters = require('../service/DriftersService');

module.exports.drifterMetaSearch = function drifterMetaSearch (req, res, next, id, wmo) {
  Drifters.drifterMetaSearch(id, wmo)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.drifterSearch = function drifterSearch (req, res, next, startDate, endDate, polygon, multipolygon, id, wmo) {
  Drifters.drifterSearch(startDate, endDate, polygon, multipolygon, id, wmo)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.drifterVocab = function drifterVocab (req, res, next, parameter) {
  Drifters.drifterVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
