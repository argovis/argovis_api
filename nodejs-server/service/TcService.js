'use strict';


/**
 * one tropical cyclone instance
 *
 * returns tcSchema
 **/
exports.findOneTC = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * returns a list of tropical cyclone names and years
 *
 * returns List
 **/
exports.findStormNameList = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ "", "" ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * tropical cyclones at a given date-time
 *
 * date Date date-time formatted string
 * returns List
 **/
exports.findTCbyDate = function(date) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
}, {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * tropical cyclones intersecting a time period
 *
 * startDate Date date-time formatted string indicating the beginning of a time period
 * endDate Date date-time formatted string indicating the end of a time period
 * returns List
 **/
exports.findTCbyDateRange = function(startDate,endDate) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
}, {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * find a tropical cyclone by name and year
 *
 * name String name of tropical cyclone
 * year BigDecimal year of tropical cyclone
 * returns List
 **/
exports.findTCbyNameYear = function(name,year) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
}, {
  "endDate" : "2000-01-23T04:56:07.000+00:00",
  "year" : 6.027456183070403,
  "num" : 0.8008281904610115,
  "name" : "name",
  "_id" : "_id",
  "source" : "source",
  "trajData" : [ {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "date" : "date",
    "pres" : 7.061401241503109,
    "geoLocation" : {
      "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
      "type" : "type"
    },
    "season" : 9.301444243932576,
    "lon" : 5.637376656633329,
    "time" : 1.4658129805029452,
    "class" : "class",
    "lat" : 5.962133916683182,
    "wind" : 2.3021358869347655,
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  } ],
  "startDate" : "2000-01-23T04:56:07.000+00:00"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

