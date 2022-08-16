'use strict';

var utils = require('../utils/writer.js');
var Profiles = require('../service/ProfilesService');
var JSONStream = require('JSONStream')
const { pipeline } = require('node:stream/promises');
var stream = require("stream");

module.exports.findArgo = function findArgo (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, platform, source, compression, data, presRange) {
  Profiles.findArgo(id, startDate, endDate, polygon, multipolygon, center, radius, platform, source, compression, data, presRange)
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

module.exports.findArgometa = function findArgometa (req, res, next, id, platform) {
  Profiles.findArgometa(id, platform)
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

module.exports.findGoship = function findGoship (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, woceline, cchdo_cruise, compression, data, presRange) {
  Profiles.findGoship(id, startDate, endDate, polygon, multipolygon, center, radius, woceline, cchdo_cruise, compression, data, presRange)

    .then(cursor => {
      cursor.pipe(JSONStream.stringify())
      cursor.pipe(res.type('json'))
    })


    // .then(stream => {
    //   stream.pipe(JSONStream.stringify())
    //         .pipe(res.type('json'))
    // })


    // .then(stream => {
    //   stream.pipe(JSONStream.stringifyObject())
    //         .pipe(res.type('json'))
    // })


    // .then(stream => {
    //   res.type('json');
    //   async function streamDocs(stream){
    //     let counter = 0
    //     for await (const chunk of stream){
    //       res.write({'potato': counter++})
    //     }   
    //   }
    //   streamDocs(stream)
    // })

    // .then(stream => {
    //   stream.pipe(JSONStream.stringify())
    //         .pipe(res.type('json'))
    // })

    // .then(cursor => {
    //   cursor.on('data', function(doc) { console.log(doc); }).on('end', function() { console.log('Done!'); });
    // })

    // .then(cursor => {
    //   cursor.next(function(error, doc) {
    //     console.log(doc);
    //   });
    // })  


    // .then(function (response) {
    //   utils.writeJson(res, response);
    // },
    // function (response) {
    //   utils.writeJson(res, response, response.code);
    // })
    // .catch(function (response) {
    //   utils.writeJson(res, response);
    // });
};

module.exports.findGoshipmeta = function findGoshipmeta (req, res, next, id, woceline, cchdo_cruise) {
  Profiles.findGoshipmeta(id, woceline, cchdo_cruise)
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

module.exports.goshipVocab = function goshipVocab (req, res, next, parameter) {
  Profiles.goshipVocab(parameter)
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

module.exports.profile = function profile (req, res, next, startDate, endDate, polygon, box, center, radius, multipolygon, id, platform, presRange, dac, source, woceline, compression, data) {
  Profiles.profile(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform, presRange, dac, source, woceline, compression, data)
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

module.exports.profileList = function profileList (req, res, next, startDate, endDate, polygon, box, center, radius, multipolygon, dac, source, woceline, platform, presRange, data) {
  Profiles.profileList(startDate, endDate, polygon, box, center, radius, multipolygon, dac, source, woceline, platform, presRange, data)
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

module.exports.profileVocab = function profileVocab (req, res, next, parameter) {
  Profiles.profileVocab(parameter)
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

module.exports.profilesOverview = function profilesOverview (req, res, next) {
  Profiles.profilesOverview()
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
