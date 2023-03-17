'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ArgoService');
var helpers = require('../helpers/helpers')

module.exports.argoBGC = function argoBGC (req, res, next) {
  Profiles.argoBGC()
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

module.exports.argoDACs = function argoDACs (req, res, next) {
  Profiles.argoDACs()
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

module.exports.argoOverview = function argoOverview (req, res, next) {
  Profiles.argoOverview()
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

module.exports.argoVocab = function argoVocab (req, res, next, parameter) {
  Profiles.argoVocab(parameter)
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

module.exports.findArgo = function findArgo (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, metadata, platform, platform_type, source, compression, mostrecent, data, presRange) {
  Profiles.findArgo(res, id, startDate, endDate, polygon, multipolygon, center, radius, metadata, platform, platform_type, source, compression, mostrecent, data, presRange)
    .then(function (response) {
      utils.writeJson(res, response, 200);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
    // .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    // function (response) {
    //   utils.writeJson(res, response, response.code);
    // })
    // .catch(function (response) {
    //   utils.writeJson(res, response);
    // });
};

module.exports.findArgometa = function findArgometa (req, res, next, id, platform) {
  Profiles.findArgometa(res, id, platform)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
