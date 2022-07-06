module.exports = {}

module.exports.queryCallback = function(postprocess, resolve, reject, err, data){
	// standard callback for a database query that should return an array, passed in as <data>.
	// <postprocess> == optional function to mutate <data> before return
	// <resolve> and <reject> == resolve and reject functions from a promise 
    if (err){
        console.log(err)
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

module.exports.parameter_sanitization = function(id,startDate,endDate,polygon,multipolygon,center,radius){
  // sanity check and transform generic temporospatial query string parameters in preparation for search.

  params = {}

  if(id){
    params.id = String(id)
  }

  if(startDate){
    params.startDate = new Date(startDate);
  }

  if(endDate){
    params.endDate = new Date(endDate);
  }

  if(polygon){
    params.polygon = module.exports.polygon_sanitation(polygon)
    if(polygon.hasOwnProperty('code')){
      // error, return and bail out
      return polygon
    }
  }

  if(multipolygon){
    try {
      multipolygon = JSON.parse(multipolygon);
    } catch (e) {
      return {"code": 400, "message": "Multipolygon region wasn't proper JSON; format should be [[first polygon], [second polygon]], where each polygon is [lon,lat],[lon,lat],..."};
    }
    multipolygon = multipolygon.map(function(x){return module.exports.polygon_sanitation(JSON.stringify(x))})
    if(multipolygon.some(p => p.hasOwnProperty('code'))){
      multipolygon = multipolygon.filter(x=>x.hasOwnProperty('code'))
      return multipolygon[0]
    } 
    params.multipolygon = multipolygon
  }

  if(center){
    params.center = center
  }

  if(radius){
    params.radius = radius
  }

  return params
}

module.exports.request_sanitation = function(startDate, endDate, polygon, box, center, radius, multipolygon, allowAll){
  // given some parameters from a requst, decide whether or not to reject; return false == don't reject, return with message / code if do reject
  // allowAll==true allows the request if it isn't malformed; approriate for requests that have an a-priori small scope, like a single ID, platform or WOCE line.
  const geojsonArea = require('@mapbox/geojson-area');

  // basic sanity checks
  if((center && box) || (center && polygon) || (box && polygon || (multipolygon && polygon) || (multipolygon && box) || (multipolygon && center))){
    return {"code": 400, "message": "Please request only one of box, polygon, center or multipolygon."} 
  }
  if((center && !radius) || (!center && radius)){
    return {"code": 400, "message": "Please specify both radius and center to filter for data less than <radius> km from <center>."}
  }

  // geo size limits - mongo doesn't like huge geoWithins
  maxgeosearch = 45000000000000 // 60 degree box centered on equator, in sq m
  if(radius) {
    if(radius > 3000){
      return {"code": 400, "message": "Please limit proximity searches to at most 3000 km in radius"};
    }
  }
  if(polygon) {
    if(geojsonArea.geometry(polygon) > maxgeosearch){
      return {"code": 400, "message": "Polygon region is too big; please ask for 45 M square km or less in a single request, or about 60 deg x 60 deg at the equator."}
    }
  }
  if(box) {
    let polybox = {
      "type": "Polygon",
      "coordinates": [[[box[0][0], box[0][1]], [box[1][0], box[0][1]], [box[1][0], box[1][1]], [box[0][0], box[1][1]], [box[0][0], box[0][1]]]]
    }
    if(geojsonArea.geometry(polybox) > maxgeosearch){
      return {"code": 400, "message": "Box region is too big; please ask for 45 M square km or less in a single request, or about 60 deg x 60 deg at the equator."}
    }
  }
  if(multipolygon){
    if(multipolygon.every(p => geojsonArea.geometry(p) > maxgeosearch)){
      return {"code": 400, "message": "All Multipolygon regions are too big; at least one of them must be 45 M square km or less, or about 60 deg x 60 deg at the equator."}
    }
  }

  // data volume limits
  if(allowAll){
    // always allow single ID or platform searches at this point
    return false
  }
  if(!startDate){
    startDate = new Date('1900-01-01T00:00:00Z')
  }
  if(!endDate){
    endDate = new Date()
  }
  let dayspan = Math.round(Math.abs((endDate - startDate) / (24*60*60*1000) )); // n days of request
  let geospan = 41252.96125*0.7 // square degrees covered by earth's ocean, equivalent to the entire globe for our purposes
  if(polygon){
    geospan = geojsonArea.geometry(polygon) / 13000000000 // 1 sq degree is about 13B sq meters at eq
  } else if(box){
    geospan = Math.abs(box[0][0] - box[1][0])*Math.abs(box[0][1] - box[1][1])
  } else if(center && radius){
    geospan = 3.14159*radius*radius / 13000 // recall radius is reported in km
  } else if(multipolygon){
    let areas = multipolygon.map(x => geojsonArea.geometry(x) / 13000000000)
    geospan = Math.min(areas)
  }
  console.log(9999, dayspan, geospan)
  if(dayspan*geospan > 50000){
    return {"code":413, "message": "The estimated size of your request is pretty big; please split it up into a few smaller requests. To get an idea of how to scope your requests, and depending on your needs, you may consider asking for a 1 degree by 1 degree region for all time; a 15 deg by 15 deg region for 6 months; or the entire globe for a day. Or, try asking for specific object IDs, where applicable."};
  }

  return false
}

module.exports.datatable_match = function(model, params, local_filter, foreign_docs){
  // given <model>, a mongoose model pointing to a data collection,
  // <params> the return object from parameter_sanitization,
  // <local_filter> a custom set of aggregation pipeline steps to be applied to the data collection reffed by <model>,
  // and <foreign_docs>, an array of documents matching a query on the metadata collection which should constrain which data collection docs we return,
  // return a promise to search <model> for all of the above.

  let spacetimeMatch = []
  let proxMatch = []
  let foreignMatch = []
  console.log(1000, local_filter, foreign_docs)
  
  // construct match stages as required
  /// prox match construction
  if(params.center && params.radius) {
    proxMatch.push({$geoNear: {key: 'geolocation', near: {type: "Point", coordinates: [params.center[0], params.center[1]]}, maxDistance: 1000*params.radius, distanceField: "distcalculated"}}) 
    proxMatch.push({ $unset: "distcalculated" })
  }
  /// spacetime match construction
  if(params.startDate || params.endDate || params.polygon || params.multipolygon){
    spacetimeMatch[0] = {$match: {}}
    if (params.startDate && params.endDate){
      spacetimeMatch[0]['$match']['timestamp'] = {$gte: params.startDate, $lte: params.endDate}
    } else if (params.startDate){
      spacetimeMatch[0]['$match']['timestamp'] = {$gte: params.startDate}
    } else if (params.endDate){
      spacetimeMatch[0]['$match']['timestamp'] = {$lte: params.endDate}
    }
    if(params.polygon) {
      spacetimeMatch[0]['$match']['geolocation'] = {$geoWithin: {$geometry: params.polygon}}
    }
    if(params.multipolygon){
      params.multipolygon.sort((a,b)=>{geojsonArea.geometry(a) - geojsonArea.geometry(b)}) // smallest first to minimize size of unindexed geo search
      spacetimeMatch[0]['$match']['geolocation'] = {$geoWithin: {$geometry: params.multipolygon[0]}}
    }
    // zoom in on subsequent polygon regions; will be unindexed.
    if(params.multipolygon && params.multipolygon.length > 1){
      for(let i=1; i<params.multipolygon.length; i++){
        spacetimeMatch.push( {$match: {"geolocation": {$geoWithin: {$geometry: params.multipolygon[i]}}}} )
      }
    }
    spacetimeMatch.push({$sort: {'timestamp':-1}})
  }
  /// construct filter for matching metadata docs if required
  if(foreign_docs){
    let metaIDs = new Set(foreign_docs.map(x => x['_id']))
    foreignMatch.push({$match:{'metadata':{$in:Array.from(metaIDs)}}})
  }

  // set up aggregation and return promise to evaluate:
  let aggPipeline = proxMatch.concat(local_filter).concat(foreignMatch).concat(spacetimeMatch)
  console.log(2000, aggPipeline, model.aggregate(aggPipeline).exec() )
  return model.aggregate(aggPipeline).exec()
}

module.exports.postprocess = function(pp_params, search_result){
  // given <pp_params> which defines level filtering and compression decisions,
  // and <search_result> an array of documents returned from a data collection,
  // filter for requested levels and perform compression/reinflation as desired.

  if(search_result.length == 0){
    return {"code": 404, "message": "Not found: No matching results found in database."}
  }
  
  return search_result

}