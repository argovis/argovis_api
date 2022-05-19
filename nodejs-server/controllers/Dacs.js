'use strict';

var utils = require('../utils/writer.js');
var Dacs = require('../service/DacsService');

module.exports.dacSummary = function dacSummary (req, res, next) {
  Dacs.dacSummary()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
