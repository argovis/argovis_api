'use strict';

var utils = require('../utils/writer.js');
var Ping = require('../service/PingService');

module.exports.ping = function ping (req, res, next) {
  Ping.ping()
    .then(function (response) {
      utils.writeJson(res, response, 200);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};