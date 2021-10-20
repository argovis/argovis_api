'use strict';

var utils = require('../utils/writer.js');
var Ar = require('../service/ArService');

module.exports.findAR = function findAR (req, res, next, date, _id) {
  Ar.findAR(date, _id)
    .then(function (response) {
      utils.writeJson(res, response, 200);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
