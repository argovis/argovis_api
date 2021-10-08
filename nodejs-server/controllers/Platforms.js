'use strict';

var utils = require('../utils/writer.js');
var Platforms = require('../service/PlatformsService');

module.exports.bgcPlatformList = function bgcPlatformList (req, res, next) {
  Platforms.bgcPlatformList()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.platformList = function platformList (req, res, next) {
  Platforms.platformList()
    .then(function (response) {
      utils.writeJson(res, response);
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
