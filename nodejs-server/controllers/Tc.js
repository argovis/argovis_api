'use strict';

var utils = require('../utils/writer.js');
var Tc = require('../service/TcService');

module.exports.findStormNameList = function findStormNameList (req, res, next) {
  Tc.findStormNameList()
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

module.exports.findTC = function findTC (req, res, next, startDate, endDate, name, year) {
  Tc.findTC(startDate, endDate, name, year)
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
