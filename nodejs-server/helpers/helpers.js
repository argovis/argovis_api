const geojsonArea = require('@mapbox/geojson-area');
const Transform = require('stream').Transform
const { pipeline } = require('stream');
const JSONStream = require('JSONStream')

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

module.exports.request_sanitation = function(polygon, box, center, radius, multipolygon){
  // given some parameters from a requst, decide whether or not to reject; return false == don't reject, return with message / code if do reject

  // basic sanity checks
  if((center && box) || (center && polygon) || (box && polygon || (multipolygon && polygon) || (multipolygon && box) || (multipolygon && center))){
    return {"code": 400, "message": "Please request only one of box, polygon, center or multipolygon."} 
  }
  if((center && !radius) || (!center && radius)){
    return {"code": 400, "message": "Please specify both radius and center to filter for data less than <radius> km from <center>."}
  }

  return false
}

module.exports.datatable_match = function(model, params, local_filter, foreign_docs){
  // given <model>, a mongoose model pointing to a data collection,
  // <params> the return object from parameter_sanitization,
  // <local_filter> a custom set of aggregation pipeline steps to be applied to the data collection reffed by <model>,
  // and <foreign_docs>, an array of documents matching a query on the metadata collection which should constrain which data collection docs we return,
  // return a cursor over that which matches the above

  let spacetimeMatch = []
  let proxMatch = []
  let foreignMatch = []

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
  let aggPipeline = proxMatch.concat(spacetimeMatch).concat(local_filter).concat(foreignMatch)

  return model.aggregate(aggPipeline).exec()
}

module.exports.datatable_stream = function(model, params, local_filter, foreign_docs){
  // given <model>, a mongoose model pointing to a data collection,
  // <params> the return object from parameter_sanitization,
  // <local_filter> a custom set of aggregation pipeline steps to be applied to the data collection reffed by <model>,
  // and <foreign_docs>, an array of documents matching a query on the metadata collection which should constrain which data collection docs we return,
  // return a cursor over that which matches the above

  let spacetimeMatch = []
  let proxMatch = []
  let foreignMatch = []

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
  if(foreign_docs.length > 0 && foreign_docs[0]._id !== null){
    let metaIDs = new Set(foreign_docs.map(x => x['_id']))
    foreignMatch.push({$match:{'metadata':{$in:Array.from(metaIDs)}}})
  }

  // set up aggregation and return promise to evaluate:
  let aggPipeline = proxMatch.concat(spacetimeMatch).concat(local_filter).concat(foreignMatch)

  return model.aggregate(aggPipeline).cursor()
}

module.exports.postprocess = function(pp_params, search_result){
  // given <pp_params> which defines level filtering, data selection and compression decisions,
  // <search_result>[0] the array of documents returned from the metadata collection for this search,
  // <search_result>[1] the array of documents returned from the data collection for this search,
  // and <search_results>[2] the array of documents retuned from the metadata collection corresponding to the metadata pointers of <search_result>[1] if not present in <search_result>[0],
  // perform the requested filters and transforms

  // declare some variables at scope
  let polished = []   // array of documents passing filters and munged to perfection to be returned
  let keys = []       // data keys to keep when filtering down data
  let notkeys = []    // data ketys that disqualify a document if present
  let coerced_pressure = false
  let metadata_only = false

  // bail immediately if nothing came back from the data collection
  if(search_result[1].length == 0){
    return {"code": 404, "message": "Not found: No matching results found in database."}
  }
  
  // construct metadata lookup object
  let upstream_meta = (search_result[0] === null) ? search_result[2] : search_result[0]
  let meta_lookup = {}
  for(let i=0; i<upstream_meta.length; i++){
    meta_lookup[upstream_meta[i]['_id']] = upstream_meta[i]
  }

  // determine which data keys should be kept or tossed, if necessary
  if(pp_params.data){
    keys = pp_params.data.filter(e => e.charAt(0)!='~')
    notkeys = pp_params.data.filter(e => e.charAt(0)=='~').map(k => k.substring(1))
    if(keys.includes('metadata-only')){
      metadata_only = true
      keys.splice(keys.indexOf('metadata-only'))
    }
  }

  // loop through documents and let the munging begin
  for(let i=0; i<search_result[1].length; i++){
    let doc = search_result[1][i] // sugar

    /// identify data_keys and units, could be on either document
    let dk = null
    let u = null
    if(doc.hasOwnProperty('data_keys')) {
      dk = doc.data_keys  
      u = doc.units
    }
    else{
      dk = meta_lookup[doc.metadata].data_keys
      u = meta_lookup[doc.metadata].units
    }

    /// bail out on this document if it contains any ~keys:
    if(dk.some(item => notkeys.includes(item))) continue

    /// force return of pressure for anything that has a pressure data key
    if(dk.includes('pressure') && !keys.includes('pressure')){
      keys.push('pressure')
      coerced_pressure = true
    }

    /// turn upstream units into a lookup table by data_key
    let units = {}
    for(let k=0; k<dk.length; k++){
      units[dk[k]] = u[k]
    }

    /// reinflate data arrays as a dictionary keyed by depth, and only keep requested data
    let reinflated_levels = {}
    let metalevels = null
    if(meta_lookup[doc.metadata].hasOwnProperty('levels')){
      metalevels = meta_lookup[doc.metadata].levels // relevant for grids
    } else if (!dk.includes('pressure')){
      metalevels = [0] // some sea surface datasets have no levels metadata and no profile-like pres key, since they're all implicitly single-level pres=0 surface measurements
    }
    for(let j=0; j<doc.data.length; j++){ // loop over levels
      let reinflate = {}
      for(k=0; k<doc.data[j].length; k++){ // loop over data variables
        if( (keys.includes(dk[k]) || keys.includes('all')) && !isNaN(doc.data[j][k]) && doc.data[j][k] !== null){ // ie only keep data that was actually requested, and which actually exists
          reinflate[dk[k]] = doc.data[j][k]
        }
      }
      if(Object.keys(reinflate).length > (coerced_pressure ? 1 : 0)){ // ie only keep levels that retained some data other than a coerced pressure record
        let lvl = metalevels ? metalevels[j] : reinflate.pressure
        reinflated_levels[lvl] = reinflate
      }
    }

    /// filter by presRange
    let levels = []
    if(pp_params.presRange){
      levels = Object.keys(reinflated_levels).filter(k => Number(k) >= pp_params.presRange[0] && Number(k) <= pp_params.presRange[1])
    } else {
      levels = Object.keys(reinflated_levels)
    }
    levels = levels.map(n=>Number(n)).sort((a,b)=>a-b)

    /// translate level-keyed dictionary back to a sorted list of per-level dictionaries
    if(metalevels && pp_params.presRange){
      /// need to make a levels property on the data document that overrides the levels property on the metadata doc if level filtering has happened, for grid-like objects
      doc.levels = levels
    }
    doc.data = levels.map(k=>reinflated_levels[String(k)])

    /// if we wanted data and none is left, abandon this document
    if(keys.length>(coerced_pressure ? 1 : 0) && doc.data.length==0) continue

    /// drop data on metadata only requests
    if(!pp_params.data || metadata_only){
      delete doc.data
      delete doc.levels
    }

    /// manage data_keys and units
    if(keys.includes('all') && !metadata_only){
      doc.data_keys = dk
      doc.units = units
    }
    else if( (keys.length > (coerced_pressure ? 1 : 0)) && !metadata_only){
      doc.data_keys = keys
      doc.units = units
      for(const prop in units){
        if(!keys.includes(prop)) delete doc.units[prop]
      }
    }

    /// deflate data if requested
    if(pp_params.compression && pp_params.data && !metadata_only){
      doc.data = doc.data.map(x => {
        let lvl = []
        for(let ii=0; ii<doc.data_keys.length; ii++){
          if(x.hasOwnProperty(doc.data_keys[ii])){
            lvl.push(x[doc.data_keys[ii]])
          } else {
            lvl.push(null)
          }
        }
        return lvl
      })
      doc.units = doc.data_keys.map(x => doc.units[x])
    }

    polished.push(doc)
  }

  if(polished.length == 0){
    return {"code": 404, "message": "Not found: No matching results found in database."}
  }

  return polished

}

module.exports.postprocess_stream = function(chunk, metadata, pp_params){
  // <chunk>: raw data table document
  // <metadata>: metadata doc corresponding to this chunk
  // <pp_params>: kv which defines level filtering, data selection and compression decisions
  // returns chunk mutated into its final, user-facing form
  // or return false to drop this item from the stream

  // declare some variables at scope
  let keys = []       // data keys to keep when filtering down data
  let notkeys = []    // data ketys that disqualify a document if present
  let my_meta = null  // metadata document corresponding to chunk
  let coerced_pressure = false
  let metadata_only = false
  
  // determine which data keys should be kept or tossed, if necessary
  if(pp_params.data){
    keys = pp_params.data.filter(e => e.charAt(0)!='~')
    notkeys = pp_params.data.filter(e => e.charAt(0)=='~').map(k => k.substring(1))
    if(keys.includes('metadata-only')){
      metadata_only = true
      keys.splice(keys.indexOf('metadata-only'))
    }
  }

  // identify data_keys and units, could be on chunk or metadata
  let dk = null
  let u = null
  if(chunk.hasOwnProperty('data_keys')) {
    dk = chunk.data_keys  
    u = chunk.units
  }
  else{
    dk = metadata.data_keys
    u = metadata.units
  }

  // bail out on this document if it contains any ~keys:
  if(dk.some(item => notkeys.includes(item))) return false

  // force return of pressure for anything that has a pressure data key
  if(dk.includes('pressure') && !keys.includes('pressure')){
    keys.push('pressure')
    coerced_pressure = true
  }

  // turn upstream units into a lookup table by data_key
  let units = {}
  for(let k=0; k<dk.length; k++){
    units[dk[k]] = u[k]
  }

  // reinflate data arrays as a dictionary keyed by depth, and only keep requested data
  let reinflated_levels = {}
  let metalevels = null
  if(metadata.hasOwnProperty('levels')){
    metalevels = metadata.levels // relevant for grids
  } else if (!dk.includes('pressure')){
    metalevels = [0] // some sea surface datasets have no levels metadata and no profile-like pres key, since they're all implicitly single-level pres=0 surface measurements
  }
  for(let j=0; j<chunk.data.length; j++){ // loop over levels
    let reinflate = {}
    for(k=0; k<chunk.data[j].length; k++){ // loop over data variables
      if( (keys.includes(dk[k]) || keys.includes('all')) && !isNaN(chunk.data[j][k]) && chunk.data[j][k] !== null){ // ie only keep data that was actually requested, and which actually exists
        reinflate[dk[k]] = chunk.data[j][k]
      }
    }
    if(Object.keys(reinflate).length > (coerced_pressure ? 1 : 0)){ // ie only keep levels that retained some data other than a coerced pressure record
      let lvl = metalevels ? metalevels[j] : reinflate.pressure
      reinflated_levels[lvl] = reinflate
    }
  }

  // filter by presRange
  let levels = []
  if(pp_params.presRange){
    levels = Object.keys(reinflated_levels).filter(k => Number(k) >= pp_params.presRange[0] && Number(k) <= pp_params.presRange[1])
  } else {
    levels = Object.keys(reinflated_levels)
  }
  levels = levels.map(n=>Number(n)).sort((a,b)=>a-b)

  // translate level-keyed dictionary back to a sorted list of per-level dictionaries
  if(metalevels && pp_params.presRange){
    /// need to make a levels property on the data document that overrides the levels property on the metadata doc if level filtering has happened, for grid-like objects
    chunk.levels = levels
  }
  chunk.data = levels.map(k=>reinflated_levels[String(k)])

  // if we wanted data and none is left, abandon this document
  if(keys.length>(coerced_pressure ? 1 : 0) && chunk.data.length==0) return false

  // drop data on metadata only requests
  if(!pp_params.data || metadata_only){
    delete chunk.data
    delete chunk.levels
  }

  // manage data_keys and units
  if(keys.includes('all') && !metadata_only){
    chunk.data_keys = dk
    chunk.units = units
  }
  else if( (keys.length > (coerced_pressure ? 1 : 0)) && !metadata_only){
    chunk.data_keys = keys
    chunk.units = units
    for(const prop in units){
      if(!keys.includes(prop)) delete chunk.units[prop]
    }
  }

  // deflate data if requested
  if(pp_params.compression && pp_params.data && !metadata_only){
    chunk.data = chunk.data.map(x => {
      let lvl = []
      for(let ii=0; ii<chunk.data_keys.length; ii++){
        if(x.hasOwnProperty(chunk.data_keys[ii])){
          lvl.push(x[chunk.data_keys[ii]])
        } else {
          lvl.push(null)
        }
      }
      return lvl
    })
    chunk.units = chunk.data_keys.map(x => chunk.units[x])
  }

  return chunk
}

module.exports.post_xform = function(metaModel, pp_params, search_result, res){

  let nDocs = 0
  const postprocess = new Transform({
    objectMode: true,
    transform(chunk, encoding, next){
      // wait on a promise to get this chunk's metadata back
      module.exports.locate_meta(chunk['metadata'], search_result[0], metaModel)
          .then(meta => {
            // keep track of new metadata docs so we don't look them up twice
            if(!search_result[0].find(x => x._id == chunk['metadata'])) search_result[0].push(meta)
            // munge the chunk and push it downstream if it isn't rejected.
            let doc = module.exports.postprocess_stream(chunk, meta, pp_params)
             if(doc){
                this.push(doc)
                nDocs++
            }
            next()
          })
    }
  });
  
  postprocess._flush = function(callback){
    if(nDocs == 0){
      res.status(404)
    }
    return callback()
  }

  return postprocess
}

module.exports.locate_meta = function(meta_id, meta_list, meta_model){
  // <meta_id>: id of meta document of interest
  // <meta_list>: current array of fetched meta docs
  // <meta_model>: collection model tp go looking in
  // return a promise that resolves to the metadata record sought.

  let my_meta = meta_list.find(x => x._id == meta_id)
  if(typeof my_meta !== 'undefined'){
    return new Promise(function(resolve, reject){resolve(my_meta)})
  } else {
    // go looking in mongo
    let metaquery = meta_model.findOne({ _id: meta_id });
    return metaquery.exec();
  }
}

module.exports.meta_lookup = function(meta_model, data_docs){
  // given an array <data_docs> of docs from a data collection,
  // return a promise for all matching metadata documents in model <meta_model>

  let metakeys = new Set(data_docs.map(x => x['metadata']))
  let aggPipeline = [{$match:{'_id':{$in:Array.from(metakeys)}}}]
  return meta_model.aggregate(aggPipeline).exec()

}

module.exports.lookup_key = function(userModel, apikey, resolve, reject){
    // look up an apikey from mongo, and reject if not found or not valid.

    const query = userModel.find({key: apikey})
    query.exec(function(err, user){
      if (err){
          reject({"code": 500, "message": "Server error"});
          return;
      }
      if(user.length == 0){
          reject({"code": 404, "message": "Not found: User key not found in database."});
          return;
      }
      if(!user[0].toObject().tokenValid){
        reject({"code": 403, "message": "API token has been deactivated; please contact argovis@colorado.edu for assistance."})
        return;
      }
      
      resolve(user[0].toObject())
    })
}

module.exports.cost = function(url, c, cellprice, metaDiscount, maxbulk){
  // return the tokenbucket price for this URL.
  // c == defualt cost
  // cellprice == token cost of 1 sq deg day
  // metaDiscount == scaledown factor to discount metadata-only request by relative to data requests
  // maxbulk == maximum allowed size of ndays x area[sq km]/13000sqkm; set to prevent OOM crashes

  let earliest_records = {
    'argo': Date("1997-07-28T20:26:20.002Z"),
    'goship': Date("1977-10-07T00:00:00Z"),
    'drifters': Date("1987-10-02T13:00:00Z"),
    'ohc_kg': Date("2005-01-15T00:00:00Z"),
    'temperature_rg': Date("2004-01-15T00:00:00Z"),
    'salinity_rg': Date("2004-01-15T00:00:00Z"),
    'tc': Date("1851-06-25T00:00:00Z")
  }

  /// determine path steps
  let path = url.split('?')[0].split('/').slice(3)

  /// tokenize query string
  let qString = new URLSearchParams(url.split('?')[1]);

  /// handle standardized routes
  let standard_routes = ['argo', 'goship', 'drifters', 'tc', 'grids']
  if(standard_routes.includes(path[0])){
    //// core data routes
    if(path.length==1 || (path[0]=='grids' && path.length==2)){
      ///// any query parameter that specifies a particular record or small set of records can get waived through
      if(qString.get('id') || qString.get('platform') || qString.get('wmo') || qString.get('name')){
        c = 1
      }

      //// query parameters that specify a larger but still circumscribed number of records
      else if(qString.get('woceline') || qString.get('cchdo_cruise')){
        c = 10
      }

      ///// assume a temporospatial query absent the above (and if _nothing_ is provided, assumes and rejects an all-space-and-time request)
      else{
        ///// parameter cleaning and coercing
        let params = module.exports.parameter_sanitization(null,qString.get('startDate'),qString.get('endDate'),qString.get('polygon'),qString.get('multipolygon'),qString.get('center'),qString.get('radius'))
        if(params.hasOwnProperty('code')){
          return params
        }
              params.startDate = params.startDate ? params.startDate : earliest_records[path[path.length-1]]
              params.endDate = params.endDate ? params.endDate : Date()

              ///// decline requests that are too geographically enormous
              let checksize = module.exports.maxgeo(params.polygon, params.multipolygon, params.center, params.radius)
              if(checksize.hasOwnProperty('code')){
                return checksize
              }

              ///// cost out request
              let geospan = module.exports.geoarea(params.polygon,params.multipolygon,params.radius) / 13000 // 1 sq degree is about 13k sq km at eq
              let dayspan = Math.round(Math.abs((params.endDate - params.startDate) / (24*60*60*1000) )); // n days of request

              if(geospan*dayspan > maxbulk){
                return {"code": 413, "message": "The temporospatial extent of your request is very large and likely to crash our API. Please request a smaller region or shorter timespan, or both."}
              }
              c = geospan*dayspan*cellprice

              ///// metadata discount
              if(!url.includes('data') || url.includes('metadata-only')){
                c /= metaDiscount
              }
          }

    }
    //// */meta and */vocabulary routes unconstrained for now  
  }

  /// all other routes unconstrained for now

    return c
}

module.exports.maxgeo = function(polygon, multipolygon, center, radius){
    // geo size limits - mongo doesn't like huge geoWithins
    let maxgeosearch = 250000000000000 // a little less than half the globe
    if(radius) {
      if(radius > 10000){
        return {"code": 400, "message": "Please limit proximity searches to at most 10000 km in radius"};
      }
    }
    if(polygon) {
      if(geojsonArea.geometry(polygon) > maxgeosearch){
        return {"code": 400, "message": "Polygon region is too big; please ask for less than half the globe at a time, or query the entire globe by leaving off the polygon query parameter."}
      }
    }
    if(multipolygon){
      if(multipolygon.some(p => geojsonArea.geometry(p) > maxgeosearch)){
        return {"code": 400, "message": "At least one multipolygon region is too big; please ask for less than half the globe at a time in each."}
      }
    }

    return 0
}

module.exports.geoarea = function(polygon, multipolygon, radius){
  // return the area in sq km of the defined region

  let geospan = 360000000 // 360M sq km, all the oceans
  if(polygon){
      geospan = geojsonArea.geometry(polygon) / 1000000
  } else if(radius){
      geospan = 3.14159*radius*radius // recall radius is reported in km
  } else if(multipolygon){
    let areas = multipolygon.map(x => geojsonArea.geometry(x) / 1000000)
    geospan = Math.min(areas)
  }

  return geospan
}

module.exports.data_pipeline = function(res, pipefittings){
  pipeline(
    ...pipefittings,
    JSONStream.stringify(),
    res.type('json'),
    (err) => {
      if(err){
        console.log(err.message)
      }
    }
  )
}




