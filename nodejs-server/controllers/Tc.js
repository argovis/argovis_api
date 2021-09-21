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