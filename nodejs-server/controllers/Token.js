'use strict';

var utils = require('../utils/writer.js');
var Token = require('../service/TokenService');

module.exports.validateToken = function validateToken (req, res, next, token) {
  Token.validateToken(token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
