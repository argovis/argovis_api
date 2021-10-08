'use strict';

var utils = require('../utils/writer.js');
var Selection = require('../service/SelectionService');

module.exports.selectionGlobalMapProfiles = function selectionGlobalMapProfiles (req, res, next, startDate, endDate) {
  Selection.selectionGlobalMapProfiles(startDate, endDate)
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

