'use strict';

var utils = require('../utils/writer.js');
var Cchdo = require('../service/CchdoService');

module.exports.cchdoVocab = function cchdoVocab (req, res, next, parameter) {
  Cchdo.cchdoVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCCHDO = function findCCHDO (req, res, next, id, startDate, endDate, polygon, box, center, radius, metadata, woceline, expocode, cchdo_cruise, source, compression, data, presRange, verticalRange, batchmeta) {
  Cchdo.findCCHDO(id, startDate, endDate, polygon, box, center, radius, metadata, woceline, expocode, cchdo_cruise, source, compression, data, presRange, verticalRange, batchmeta)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findCCHDOmeta = function findCCHDOmeta (req, res, next, id, woceline, expocode, cchdo_cruise) {
  Cchdo.findCCHDOmeta(id, woceline, expocode, cchdo_cruise)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
