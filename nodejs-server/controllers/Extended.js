'use strict';

var utils = require('../utils/writer.js');
var Extended = require('../service/ExtendedService');

module.exports.extendedVocab = function extendedVocab (req, res, next, extendedName) {
  Extended.extendedVocab(extendedName)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findExtended = function findExtended (req, res, next, extendedName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent) {
  Extended.findExtended(extendedName, id, startDate, endDate, polygon, multipolygon, winding, center, radius, compression, mostrecent)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findextendedMeta = function findextendedMeta (req, res, next, id) {
  Extended.findextendedMeta(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
