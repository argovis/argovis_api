'use strict';

var utils = require('../utils/writer.js');
var Ccmp = require('../service/CcmpService');

module.exports.ccmpMetaSearch = function ccmpMetaSearch (req, res, next, id) {
  Ccmp.ccmpMetaSearch(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.ccmpSearch = function ccmpSearch (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, metadata, compression, mostrecent, data) {
  Ccmp.ccmpSearch(id, startDate, endDate, polygon, multipolygon, center, radius, metadata, compression, mostrecent, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.ccmpVocab = function ccmpVocab (req, res, next, parameter) {
  Ccmp.ccmpVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
