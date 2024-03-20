'use strict';

var utils = require('../utils/writer.js');
var Easyocean = require('../service/EasyoceanService');

module.exports.easyoceanVocab = function easyoceanVocab (req, res, next, parameter) {
  Easyocean.easyoceanVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findeasyocean = function findeasyocean (req, res, next, id, startDate, endDate, polygon, multipolygon, box, winding, center, radius, metadata, woceline, compression, mostrecent, data, presRange, batchmeta, section_start_date) {
  Easyocean.findeasyocean(id, startDate, endDate, polygon, multipolygon, box, winding, center, radius, metadata, woceline, compression, mostrecent, data, presRange, batchmeta, section_start_date)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findeasyoceanmeta = function findeasyoceanmeta (req, res, next, woceline) {
  Easyocean.findeasyoceanmeta(woceline)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
