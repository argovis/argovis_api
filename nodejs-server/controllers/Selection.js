'use strict';

var utils = require('../utils/writer.js');
var Selection = require('../service/SelectionService');

module.exports.selectionProfileList = function selectionProfileList (req, res, next, presRange, ids) {
  Selection.selectionProfileList(presRange, ids)
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
