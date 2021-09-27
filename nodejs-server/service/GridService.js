'use strict';


/**
 * returns a single grid by name
 *
 * gridName String name of the gridded product
 * returns List
 **/
exports.findGrid = function(gridName) {
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
 * grid parameter search
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * param String tbd
 * returns List
 **/
exports.findGridParam = function(gridName,presLevel,param) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "pres" : 0.8008281904610115,
  "param" : "param",
  "trend" : "trend",
  "model" : "model",
  "measurement" : "measurement"
}, {
  "pres" : 0.8008281904610115,
  "param" : "param",
  "trend" : "trend",
  "model" : "model",
  "measurement" : "measurement"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * coordinates for gridded product
 *
 * gridName String name of the gridded product
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * returns List
 **/
exports.gridCoords = function(gridName,latRange,lonRange) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "gridName" : "gridName",
  "lats" : [ 0.8008281904610115, 0.8008281904610115 ],
  "lons" : [ 6.027456183070403, 6.027456183070403 ],
  "_id" : "_id"
}, {
  "gridName" : "gridName",
  "lats" : [ 0.8008281904610115, 0.8008281904610115 ],
  "lons" : [ 6.027456183070403, 6.027456183070403 ],
  "_id" : "_id"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * metadata from grid unique dates, pres levels
 *
 * gridName String name of the gridded product
 * returns List
 **/
exports.gridmeta = function(gridName) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "minDate" : "2000-01-23T04:56:07.000+00:00",
  "dates" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "maxDate" : "2000-01-23T04:56:07.000+00:00",
  "_id" : "",
  "presLevels" : [ 0.8008281904610115, 0.8008281904610115 ]
}, {
  "minDate" : "2000-01-23T04:56:07.000+00:00",
  "dates" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "maxDate" : "2000-01-23T04:56:07.000+00:00",
  "_id" : "",
  "presLevels" : [ 0.8008281904610115, 0.8008281904610115 ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * non uniformly spaced rectangular gridded product
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * date Date date-time formatted string
 * returns List
 **/
exports.nonuniformGridWindow = function(gridName,presLevel,latRange,lonRange,date) {
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
 * uniformly spaced rectangular gridded product selector
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * date Date date-time formatted string
 * returns List
 **/
exports.uniformGridWindow = function(gridName,presLevel,latRange,lonRange,date) {
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
 * tbd
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * param String tbd
 * returns List
 **/
exports.windowGridParam = function(gridName,presLevel,latRange,lonRange,param) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "gridName" : "gridName",
  "pres" : 0.8008281904610115,
  "units" : "units",
  "cellXSize" : 6.027456183070403,
  "measurement" : "measurement",
  "nCols" : 7,
  "yllCorner" : 3.616076749251911,
  "nRows" : 2,
  "param" : "param",
  "xllCorner" : 9.301444243932576,
  "noDataValue" : 5.962133916683182,
  "zs" : [ 5.637376656633329, 5.637376656633329 ],
  "_id" : "_id",
  "cellYSize" : 1.4658129805029452
}, {
  "gridName" : "gridName",
  "pres" : 0.8008281904610115,
  "units" : "units",
  "cellXSize" : 6.027456183070403,
  "measurement" : "measurement",
  "nCols" : 7,
  "yllCorner" : 3.616076749251911,
  "nRows" : 2,
  "param" : "param",
  "xllCorner" : 9.301444243932576,
  "noDataValue" : 5.962133916683182,
  "zs" : [ 5.637376656633329, 5.637376656633329 ],
  "_id" : "_id",
  "cellYSize" : 1.4658129805029452
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

