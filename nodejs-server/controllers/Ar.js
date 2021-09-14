'use strict';

var utils = require('../utils/writer.js');
var Ar = require('../service/ArService');

module.exports.findARbyDate = function findARbyDate (req, res, next, date) {
  Ar.findARbyDate(date)
    .then(function (response) {
      utils.writeJson(res, response);
    },
    function (responseCode) {
      utils.writeJson(res, {}, responseCode);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findARbyID = function findARbyID (req, res, next, _id) {
  Ar.findARbyID(_id)
    .then(function (response) {
      utils.writeJson(res, response);
    },
    function (responseCode) {
      utils.writeJson(res, {}, responseCode);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
