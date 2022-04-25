'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');


module.exports.gridselect = function gridselect (req, res, next, gridName, polygon, startDate, endDate, presRange) {
  console.log('controller grid:', gridName)
  console.log('controller poly:', polygon)
  console.log('controller start:', startDate)
  console.log('controller end:', endDate)
  console.log('controller pres:', presRange)
  Grid.gridselect(gridName, polygon, startDate, endDate, presRange)
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
