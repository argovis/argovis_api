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

module.exports.intersects = function(arrayA, arrayB){
    // returns true if arrayA and arrayB have at least one element in common
    return arrayA.filter(value => arrayB.includes(value)).length > 0
}

module.exports.zip = function(arrays){
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

module.exports.has_data = function(profile, keys, check_levels){
  // return false if any of the keys in the keys array have no data in profile.data, or if a ~key is present
  // Assume data_keys indicated which variables are present unless check_levels==true

  // must be false if no data
  if(!('data' in profile) || profile.data.length == 0){
    return false
  }

  // collect not-keys, and return false if any are present
  let notkeys = keys.filter(e => e.charAt(0)=='~').map(k => k.substring(1))
  for(let i=0; i<notkeys.length; i++){
    if(profile.data_keys.includes(notkeys[i])){
      return false
    }
  }

  // no further questions if we just want everything except the nots
  if(keys.includes('all')){
    return true
  }

  // collect only actual data keys, not flags or nots, and return false for any profiles that dont have these
  let datakeys = keys.filter(e => e!='metadata-only' && e.charAt(0)!='~')
  for(let i=0; i<datakeys.length; i++){
    if(!profile.data_keys.includes(datakeys[i])){
      return false
    }
  }

  // must have pressure regardless
  if(!profile.data_keys.includes('pres')){
    return false
  }

  // turn profile.data into per-variable arrays, and check that the requested ones have some interesting data
  if(check_levels){
    let vars = module.exports.zip(profile.data)
    for(let i=0; i<datakeys.length; i++){
      let d = vars[profile.data_keys.indexOf(datakeys[i])]
      if(d.every(e => isNaN(e))){
        return false
      }
    }  
  }

  return true
}

module.exports.variable_bracket = function(key, min, max, profile){
  // given a profile, a data key and a min and max value,
  // filter out levels in the profile for which the value of the key variable falls outside the [min, max] range.

  if ('data' in profile){
    let column_idx = profile.data_keys.findIndex(elt => elt==key)
    if(column_idx >= 0){
      profile.data = profile.data.filter(level => level[column_idx] < max && level[column_idx]>min)
    }
  }

  return profile
}

module.exports.reduce_data = function(profile, keys, suppress_pressure){
  // profile == profile object returned from mongo
  // keys == list of keys to keep from profile.data
  // don't admit levels with only pressure info if suppress_pressure=true
  // return the original profile, with p.data and p.data_keys mutated to suit the requested keys

  if ( !('data' in profile) || profile.data.length==0) {
    // nothing to do
    return profile
  }

  let vars = module.exports.zip(profile.data)
  let keepers = profile.data_keys.map(x => keys.includes(x))
  let data = []
  let data_keys = []
  for(let i=0; i<keepers.length; i++){
    if(keepers[i]){
      data.push(vars[i])
      data_keys.push(profile.data_keys[i])
    }
  }

  profile.data_keys = data_keys
  if(data.length > 0) {
    profile.data = module.exports.zip(data) 
  }

  // filter out levels that have only pressure and qc, unless pres or that qc was specifically requested;
  // if pres was coerced in, don't allow pres alone to preserve the level.
  let value_columns = data_keys.map( key => (!key.includes('pres') && !key.includes('_qc')) || keys.includes(key))
  if(suppress_pressure){
    value_columns[data_keys.indexOf('pres')] = false
  }
  profile.data = profile.data.filter(level => level.filter((val, i) => value_columns[i]).some(e => !isNaN(e) && e!==null))

  return profile
}

module.exports.filter_data = function(profiles, data, presRange){
    // profiles (mandatory) == array of profile docs as returned from mongo
    // data (nullable) == array of data variables to be filtered on and possibly returned
    // presRange (nullable) == pressure range of interest [min,max]
    // returns array of profiles with any profile removed that doesn't have information for each variable listed in data within presRange, and filters profile.data down to the requested keys, or no keys if metadata-only present in data list.

    if(presRange){
      // throw out levels out of range
      profiles = profiles.map(p => module.exports.variable_bracket.bind(null, 'pres', presRange[0], presRange[1])(p) )
      // throw out profiles with no levels left
      profiles = profiles.filter(p => ('data' in p) && (p.data.length > 0) )
    }

    // coerce data to always have pres, if anything
    suppress_pressure = false
    if(data && !data.includes('pres') && !data.includes('all')){
        data.push('pres')
        suppress_pressure = true
    }

    // keep only profiles that have all the requested data and none of the not-data after the level filter
    if(data){
      profiles = profiles.filter(p => module.exports.has_data(p, data, presRange) )   
    }

    if(!data || data.includes('metadata-only')){
      // no more need for profile.data
      for(let i = 0; i<profiles.length; i++){
        delete profiles[i].data
      }
    }
    else if(data && !data.includes('all')){
      // keep only per-level data requested by the user, and only levels with more than none of said data.
      profiles = profiles.map(p => module.exports.reduce_data(p, data, suppress_pressure))
    }

    return profiles
}

module.exports.polygon_sanitation = function(poly){
  // given a string <poly> that describes a polygon as [[lon0,lat0],[lon1,lat1],...,[lonN,latN],[lon0,lat0]],
  // make sure its formatted sensibly, and return it as a geojson polygon.
  const GJV = require('geojson-validation')
  let p = {}

  try {
    p = JSON.parse(poly);
  } catch (e) {
    return {"code": 400, "message": "Polygon region wasn't proper JSON; format should be [[lon,lat],[lon,lat],...]"};
  }

  if(!module.exports.validlonlat(p)){
    return {"code": 400, "message": "All lon, lat pairs must respect -180<=lon<=180 and -90<=lat<-90"}; 
  }

  p = {
    "type": "Polygon",
    "coordinates": [p]
  }

  if(!GJV.valid(p)){
    return {"code": 400, "message": "Polygon region wasn't proper geoJSON; format should be [[lon,lat],[lon,lat],...]"};
  }

  return p
}

module.exports.box_sanitation = function(box){
  // given a string <box> that describes a box as [[lllon,lllat], [urlon,urlat]],
  // make sure it is formatted sensibly, an return it as a json object

  try {
    box = JSON.parse(box);
  } catch (e) {
    return {"code": 400, "message": "Box region wasn't proper JSON; format should be [[lower left lon,lower left lat],[upper right lon,upper right lat]]"};
  }
  if(box.length != 2 || 
     box[0].length != 2 || 
     box[1].length != 2 || 
     typeof box[0][0] != 'number' ||
     typeof box[0][1] != 'number' ||
     typeof box[1][0] != 'number' || 
     typeof box[1][1] != 'number') {
    return {"code": 400, "message": "Box region wasn't specified correctly; format should be [[lower left lon,lower left lat],[upper right lon,upper right lat]]"};
  }

  if(!module.exports.validlonlat(box)){
    return {"code": 400, "message": "All lon, lat pairs must respect -180<=lon<=180 and -90<=lat<-90"}; 
  }

  return box
}

module.exports.request_scoping = function(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform){
  // given some parameters from a requst, decide whether or not to reject; return false == don't reject, return with message / code if do reject
  const geojsonArea = require('@mapbox/geojson-area');

  if(id || platform){
    // always allow single ID or platform
    return false
  }

  if(!startDate){
    startDate = new Date('1980-01-01T00:00:00Z')
  }
  if(!endDate){
    endDate = new Date()
  }

  let dayspan = Math.round(Math.abs((endDate - startDate) / (24*60*60*1000) )); // n days of request

  let geospan = 360*180*0.7 // rough number of 1 deg grid points covered by request; if no geo in request, estimate as 70% of all 1 deg grid points, ie the entire ocean
  if(polygon){
    geospan = geojsonArea.geometry(polygon) / 3000000000000 * 225 // 15 deg x 15 deg is about 3M square km at the equator
  } else if(box){
    geospan = Math.abs(box[0][0] - box[1][0])*Math.abs(box[0][1] - box[1][1])
  } else if(center && radius){
    geospan = 3.14159*radius*radius / 3000000 * 225
  } else if(multipolygon){
    let areas = multipolygon.map(x => geojsonArea.geometry(x) / 3000000000000 * 225)
    geospan = Math.min(areas)
  }

  if(dayspan*geospan > 50000){
    return {"code":413, "message": "The estimated size of your request is pretty big; please split it up into a few smaller requests. To get an idea of how to scope your requests, and depending on your needs, you may consider asking for a 1 degree by 1 degree region for all time; a 15 deg by 15 deg region for 6 months; or the entire globe for a day. Or, try asking for specific profile IDs or platform IDs, where applicable."};
  }

  return false
}
