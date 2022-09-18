'use strict';

var utils = require('../utils/writer.js');
var ArExperimental = require('../service/ArExperimentalService');

module.exports.findAR = function findAR (req, res, next, date, _id) {
  ArExperimental.findAR(date, _id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
