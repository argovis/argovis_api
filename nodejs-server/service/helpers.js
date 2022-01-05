module.exports = {}

module.exports.queryCallback = function(postprocess, resolve, reject, err, data){
	// standard callback for a database query that should return an array, passed in as <data>.
	// <postprocess> == optional function to mutate <data> before return
	// <resolve> and <reject> == resolve and reject functions from a promise 
    if (err){
        reject({"code": 500, "message": "Server error"});
        return;
    }
    if(data.length == 0){
        reject({"code": 404, "message": "Not found: No matching results found in database."});
        return;
    }
    if(postprocess) resolve(postprocess(data))
    else resolve(data);
}

module.exports.steradians = function(lons, lats){
    // lons: [<low lon, high lon>] in degrees
    // lats: [<low lat, high lat>] in degrees
    // returns the steradians bounded by the provided lats, lons

    return Math.abs((lons[1]/180*Math.PI - lons[0]/180*Math.PI)*(-Math.cos(Math.PI/2 - lats[1]/180*Math.PI) + Math.cos(Math.PI/2 - lats[0]/180*Math.PI)))
}

module.exports.geoWeightedSum = function(terms){
    // terms: array of objects {value: <scalar value>, lons: [<low lon, high lon>], lats: [<low lat>, <high lat>] }
    // returns the sum of all `value` keys, multiplied by the steradians bounded by the box defined by the lats and lons (in degrees) associated with each term.

    sum = 0
    for(i=0; i<terms.length; i++){
        weight = module.exports.steradians(terms[i].lons, terms[i].lats)
        sum += weight*terms[i].value
    }

    return sum
}

module.exports.arrayinflate = function(keys, measarray){
  let meas = {}
  for(let i=0; i<keys.length; i++){
    meas[keys[i]] = measarray[i]
  }
  return meas
}

module.exports.validlonlat = function(shape){
    // shape: array of lon lat arrays, [[lon 0, lat 0], [lon 1, lat 1], [lon 2, lat 2]...]
    // returns true if all longitudes are in -180 to 180 and all latitudes are in -90 to 90, as required by mongo's geojson representation.

    return shape.every(point => point[0] >= -180 && point[0] <= 180 && point[1] >= -90 && point[1] <= 90)

}