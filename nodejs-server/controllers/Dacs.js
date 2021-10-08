'use strict';

var utils = require('../utils/writer.js');
var Dacs = require('../service/DacsService');

module.exports.dacList = function dacList (req, res, next) {
  Dacs.dacList()
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
