'use strict';

var utils = require('../utils/writer.js');
var Platforms = require('../service/PlatformsService');

module.exports.platformList = function platformList (req, res, next) {
  Platforms.platformList()
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