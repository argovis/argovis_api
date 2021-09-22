'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.findGrid = function findGrid (req, res, next, gridName) {
  Grid.findGrid(gridName)
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

module.exports.findGridParam = function findGridParam (req, res, next, gridName, presLevel, param) {
  Grid.findGridParam(gridName, presLevel, param)
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

module.exports.gridCoords = function gridCoords (req, res, next, gridName, latRange, lonRange) {
  Grid.gridCoords(gridName, latRange, lonRange)
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

module.exports.gridmeta = function gridmeta (req, res, next, gridName) {
  Grid.gridmeta(gridName)
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

module.exports.nonuniformGridWindow = function nonuniformGridWindow (req, res, next, gridName, presLevel, latRange, lonRange, date) {
  Grid.nonuniformGridWindow(gridName, presLevel, latRange, lonRange, date)
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

module.exports.uniformGridWindow = function uniformGridWindow (req, res, next, gridName, presLevel, latRange, lonRange, date) {
  Grid.uniformGridWindow(gridName, presLevel, latRange, lonRange, date)
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

module.exports.windowGridParam = function windowGridParam (req, res, next, gridName, presLevel, latRange, lonRange, param) {
  Grid.windowGridParam(gridName, presLevel, latRange, lonRange, param)
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
