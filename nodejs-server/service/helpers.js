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

module.exports.has_data = function(profile, keys){
  // return false if any of the keys in the keys array have no data in profile.data

  // must be false if no data
  if(!('data' in profile) || profile.data.length == 0){
    return false
  }

  // must be false if any requested key is absent
  for(let i=0; i<keys.length; i++){
    if(!profile.data_keys.includes(keys[i])){
      return false
    }
  }

  // turn profile.data into per-variable arrays, and check that the requested ones have some interesting data
  let vars = module.exports.zip(profile.data)
  for(let i=0; i<keys.length; i++){
    let d = vars[profile.data_keys.indexOf(keys[i])]
    if(d.every(e => isNaN(e))){
      return false
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

module.exports.reduce_data = function(profile, keys){
  // profile == profile object returned from mongo
  // keys == list of keys to keep from profile.data
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

  //filter out levels that have only pressure and qc, unless pres or that qc was specifically requested
  let value_columns = data_keys.map( key => (!key.includes('pres') && !key.includes('_qc')) || keys.includes(key))
  profile.data = profile.data.filter(level => level.filter((val, i) => value_columns[i]).some(e => !isNaN(e)))

  return profile
}

module.exports.filter_data = function(profiles, data, datavars, presRange){
    // profiles (mandatory) == array of profile docs as returned from mongo
    // data (nullable) == array of data variables to be returned to user
    // datavars (nullable) == array of data variables to filter profiles on (profile must have all)
    // presRange (nullable) == pressure range of interest [min,max]
    // returns array of profiles with any profile removed that doesn't have information for each variable listed in data and datavars in presRange, and filters profile.data down to the requested keys.

    if(presRange){
      // throw out levels out of range
      profiles = profiles.map(p => module.exports.variable_bracket.bind(null, 'pres', presRange[0], presRange[1])(p) )
      // throw out profiles with no levels left
      profiles = profiles.filter(p => ('data' in p) && (p.data.length > 0) )
    }  

    // coerce data and datavars to always have pres, if anything
    if(data && !data.includes('pres') && !data.includes('all')){
        data.push('pres')
    }
    if(datavars && !datavars.includes('pres')){
        datavars.push('pres')
    }

    // coerce datavars to be a superset of data, with the exception of 'all'
    if(data && !datavars){
      datavars = JSON.parse(JSON.stringify(data))
    }
    else if(datavars && data){
      datavars = new Set(data.concat(datavars))
      datavars = Array.from(datavars)
    }
    if(datavars && datavars.includes('all')){
      datavars.splice(datavars.indexOf('all'), 1);
    }  

    // keep only profiles that have all the requested data after the level filter
    if(datavars && datavars.length>0){
      profiles = profiles.filter(p => module.exports.has_data(p, datavars) )
    }
    else if(data && !data.includes('all')){
      profiles = profiles.filter(p => module.exports.has_data(p, data) )   
    }

    // keep only per-level data requested by the user
    if(data && !data.includes('all')){
      profiles = profiles.map(p => module.exports.reduce_data(p, data))
    }
    else if(!data){
      for(let i = 0; i<profiles.length; i++){
        delete profiles[i].data
      }
    }

    return profiles
}