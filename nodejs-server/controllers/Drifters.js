'use strict';

var utils = require('../utils/writer.js');
var Drifters = require('../service/DriftersService');

module.exports.drifterMetaSearch = function drifterMetaSearch (req, res, next, platform, wmo) {
  Drifters.drifterMetaSearch(platform, wmo)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.drifterSearch = function drifterSearch (req, res, next, startDate, endDate, polygon, multipolygon, center, radius, platform, wmo, id, compression) {
  Drifters.drifterSearch(startDate, endDate, polygon, multipolygon, center, radius, platform, wmo, id, compression)
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
