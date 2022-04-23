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
  "_id" : ""
}, {
  "gridName" : "gridName",
  "lats" : [ 0.8008281904610115, 0.8008281904610115 ],
  "lons" : [ 6.027456183070403, 6.027456183070403 ],
  "_id" : ""
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
 * gridded product selector
 *
 * gridName String name of the gridded product
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point
 * startDate Date date-time formatted string indicating the beginning of a time period
 * endDate Date date-time formatted string indicating the end of a time period
 * presRange List Pressure range (optional)
 * returns List
 **/
exports.gridselect = function(gridName,polygon,startDate,endDate,presRange) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "t" : "2000-01-23T04:56:07.000+00:00",
  "d" : [ 0.8008281904610115, 0.8008281904610115 ],
  "g" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "_id" : "_id"
}, {
  "t" : "2000-01-23T04:56:07.000+00:00",
  "d" : [ 0.8008281904610115, 0.8008281904610115 ],
  "g" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
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
  "cellXSize" : "",
  "measurement" : "measurement",
  "nCols" : 5,
  "yllCorner" : 2.3021358869347655,
  "nRows" : 1,
  "param" : "param",
  "xllCorner" : 5.637376656633329,
  "noDataValue" : "",
  "zs" : [ 6.027456183070403, 6.027456183070403 ],
  "_id" : "_id",
  "cellYSize" : ""
}, {
  "gridName" : "gridName",
  "pres" : 0.8008281904610115,
  "units" : "units",
  "cellXSize" : "",
  "measurement" : "measurement",
  "nCols" : 5,
  "yllCorner" : 2.3021358869347655,
  "nRows" : 1,
  "param" : "param",
  "xllCorner" : 5.637376656633329,
  "noDataValue" : "",
  "zs" : [ 6.027456183070403, 6.027456183070403 ],
  "_id" : "_id",
  "cellYSize" : ""
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

