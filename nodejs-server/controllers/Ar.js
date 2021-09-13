'use strict';

var utils = require('../utils/writer.js');
var Ar = require('../service/ArService');

module.exports.findARbyDate = function findARbyDate (req, res, next, date) {
  Ar.findARbyDate(date)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
