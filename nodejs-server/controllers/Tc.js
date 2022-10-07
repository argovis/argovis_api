'use strict';

var utils = require('../utils/writer.js');
var Tc = require('../service/TcService');

module.exports.findTC = function findTC (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, name, metadata, mostrecent, compression, data) {
  Tc.findTC(id, startDate, endDate, polygon, multipolygon, center, radius, name, metadata, mostrecent, compression, data)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findTCmeta = function findTCmeta (req, res, next, id, name) {
  Tc.findTCmeta(id, name)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tcVocab = function tcVocab (req, res, next, parameter) {
  Tc.tcVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
