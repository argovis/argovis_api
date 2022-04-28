'use strict';

var utils = require('../utils/writer.js');
var Platforms = require('../service/PlatformsService');

module.exports.platformList = function platformList (req, res, next, platforms) {
  Platforms.platformList(platforms)
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

module.exports.platformMeta = function platformMeta (req, res, next, platform) {
  Platforms.platformMeta(platform)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
