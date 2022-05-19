'use strict';

var utils = require('../utils/writer.js');
var Dacs = require('../service/DacsService');

module.exports.dacSummary = function dacSummary (req, res, next) {
  Dacs.dacSummary()
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
