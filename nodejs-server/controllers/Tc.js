'use strict';

var utils = require('../utils/writer.js');
var Tc = require('../service/TcService');

module.exports.findOneTC = function findOneTC (req, res, next) {
  Tc.findOneTC()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findTCbyDate = function findTCbyDate (req, res, next, date) {
  Tc.findTCbyDate(date)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findTCbyDateRange = function findTCbyDateRange (req, res, next, startDate, endDate) {
  Tc.findTCbyDateRange(startDate, endDate)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
