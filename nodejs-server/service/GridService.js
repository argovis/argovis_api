'use strict';


/**
 * uniformly spaced rectangular gridded product selector
 *
 * gridName String name of the gridded product
 * presLevel BigDecimal pressure level (dbar)
 * latRange List Latitude range (-90 to 90 degrees)
 * lonRange List Longitude range (-180 to 180 degrees)
 * date date YYYY-MM-DD format. Monthly grids use the first day of the month.
 * returns RasterGrid
 **/
exports.griddedProductsGridWindowGET = function(gridName,presLevel,latRange,lonRange,date) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "date" : "2000-01-23T04:56:07.000+00:00",
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
  "time" : 2.027123023002322,
  "cellYSize" : 1.4658129805029452
};
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
 * returns GridMeta
 **/
exports.gridmeta = function(gridName) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "minDate" : "2000-01-23T04:56:07.000+00:00",
  "dates" : [ "2000-01-23T04:56:07.000+00:00", "2000-01-23T04:56:07.000+00:00" ],
  "maxDate" : "2000-01-23T04:56:07.000+00:00",
  "_id" : "_id",
  "presLevels" : [ 0.8008281904610115, 0.8008281904610115 ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

