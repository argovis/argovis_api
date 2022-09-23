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

module.exports.validlonlat = function(shape){
    // shape: array of lon lat arrays, [[lon 0, lat 0], [lon 1, lat 1], [lon 2, lat 2]...]
    // returns true if all longitudes are in -180 to 180 and all latitudes are in -90 to 90, as required by mongo's geojson representation.

    return shape.every(point => point[0] >= -180 && point[0] <= 180 && point[1] >= -90 && point[1] <= 90)

}

module.exports.zip = function(arrays){
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
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
    polygon = module.exports.polygon_sanitation(polygon)
    if(polygon.hasOwnProperty('code')){
      // error, return and bail out
      return polygon
    }
    params.polygon = polygon
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
      spacetimeMatch[0]['$match']['timestamp'] = {$gte: params.startDate, $lt: params.endDate}
    } else if (params.startDate){
      spacetimeMatch[0]['$match']['timestamp'] = {$gte: params.startDate}
    } else if (params.endDate){
      spacetimeMatch[0]['$match']['timestamp'] = {$lt: params.endDate}
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
  }

  /// construct filter for matching metadata docs if required
  if(foreign_docs.length > 0 && foreign_docs[0]._id !== null){
    let metaIDs = new Set(foreign_docs.map(x => x['_id']))
    foreignMatch.push({$match:{'metadata':{$in:Array.from(metaIDs)}}})
  }

  // set up aggregation and return promise to evaluate:
  let aggPipeline = proxMatch.concat(spacetimeMatch).concat(local_filter).concat(foreignMatch)
  aggPipeline.push({$sort: {'timestamp':-1}})

  return model.aggregate(aggPipeline).cursor()
}

module.exports.postprocess_stream = function(chunk, metadata, pp_params){
  // <chunk>: raw data table document
  // <metadata>: metadata doc corresponding to this chunk
  // <pp_params>: kv which defines level filtering, data selection and compression decisions
  // returns chunk mutated into its final, user-facing form
  // or return false to drop this item from the stream

  // declare some variables at scope
  let keys = []       // data keys to keep when filtering down data
  let notkeys = []    // data keys that disqualify a document if present
  let my_meta = null  // metadata document corresponding to chunk
  let coerced_pressure = false
  let metadata_only = false
  
  // determine which data keys should be kept or tossed, if necessary
  if(pp_params.data){
    keys = pp_params.data.filter(e => e.charAt(0)!='~')
    notkeys = pp_params.data.filter(e => e.charAt(0)=='~').map(k => k.substring(1))
    if(keys.includes('except-data-values')){
      metadata_only = true
      keys.splice(keys.indexOf('except-data-values'))
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
    metalevels = [0] // some sea surface datasets have no levels metadata and no profile-like pressure key, since they're all implicitly single-level pres=0 surface measurements
  }
  for(let j=0; j<chunk.data.length; j++){ // loop over levels
    let reinflate = {}
    for(k=0; k<chunk.data[j].length; k++){ // loop over data variables
      if( (keys.includes(dk[k]) || keys.includes('all')) && !isNaN(chunk.data[j][k]) && chunk.data[j][k] !== null){ // ie only keep data that was actually requested, and which actually exists
        reinflate[dk[k]] = chunk.data[j][k]
      }
    }
    if(keys.includes('all') || keys.some(val => (val!='pressure' || !coerced_pressure) && Object.keys(reinflate).includes(val))){ // ie only keep levels that have at least some explicitly requested keys
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

  // if we asked for specific data and one of the desired variables isn't found anywhere, abandon this document
  if(pp_params.data && (pp_params.data.length > 1 || pp_params.data[0]!=='except-data-values')){
    for(k=0; k<keys.length; k++){
      if(keys[k] != 'all'){
        if(!chunk.data.some(level => Object.keys(level).includes(keys[k]))){
          return false
        }
      }
    }
  }

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
  if(pp_params.compression == 'array' && pp_params.data && !metadata_only){
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

  // return a minimal version if requested
  if(pp_params.compression == 'minimal'){
    let sourceset = null
    if(chunk.hasOwnProperty('source')){
      sourceset = new Set(chunk.source.map(x => x.source).flat())
    }
    chunk = [chunk['_id'], chunk.geolocation.coordinates[0], chunk.geolocation.coordinates[1], chunk.timestamp]
    if(sourceset){
      chunk.push(Array.from(sourceset))
    }
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
            let doc = null
            if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
                /// ie dont even bother with post if we've exceeded our mostrecent cap
                doc = module.exports.postprocess_stream(chunk, meta, pp_params)
            }
            if(doc){
              if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
                this.push(doc)
              }
              nDocs++
            }
            next()
          })
    }
  });
  
  postprocess._flush = function(callback){
    if(nDocs == 0){
      res.status(404)
      this.push({"code":404, "message": "No documents found matching search."})
    }
    return callback()
  }

  return postprocess
}

module.exports.meta_xform = function(res){
  // transform stream that only looks for 404s

  let nDocs = 0
  const postprocess = new Transform({
    objectMode: true,
    transform(chunk, encoding, next){
      this.push(chunk)
      next()
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
    let metaquery = meta_model.findOne({ _id: meta_id }).lean();
    return metaquery.exec();
  }
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
  // metaDiscount == scaledown factor to discount except-data-values request by relative to data requests
  // maxbulk == maximum allowed size of ndays x area[sq km]/13000sqkm; set to prevent OOM crashes

  let earliest_records = {
    'argo': new Date("1997-07-28T20:26:20.002Z"),
    'cchdo': new Date("1977-10-07T00:00:00Z"),
    'drifters': new Date("1987-10-02T13:00:00Z"),
    'ohc_kg': new Date("2005-01-15T00:00:00Z"),
    'temperature_rg': new Date("2004-01-15T00:00:00Z"),
    'salinity_rg': new Date("2004-01-15T00:00:00Z"),
    'tc': new Date("1851-06-25T00:00:00Z")
  }

  /// determine path steps
  let path = url.split('?')[0].split('/').slice(1)

  /// tokenize query string
  let qString = new URLSearchParams(url.split('?')[1]);

  /// handle standardized routes
  let standard_routes = ['argo', 'cchdo', 'drifters', 'tc', 'grids']

  if(standard_routes.includes(path[0])){
    //// core data routes
    if(path.length==1 || (path[0]=='grids' && path.length==2 && path[1]!='vocabulary' && path[1]!='meta')){
      ///// any query parameter that specifies a particular record or small set of records can get waived through
      if(qString.get('id') || qString.get('wmo') || qString.get('name')){
        c = 1
      }

      //// query parameters that specify a larger but still circumscribed number of records
      else if(qString.get('woceline') || qString.get('cchdo_cruise') || qString.get('platform') ){
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
        params.endDate = params.endDate ? params.endDate : new Date()

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
        if(isNaN(c)){
          c = 1 // protect against NaNs messing up user's token alotment
        }

        ///// metadata discount
        if(!url.includes('data') || url.includes('except-data-values') || url.includes('compression=minimal')){
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

module.exports.source_filter = function(sourcelist){
  // sourcelist: argument passed to `source` query string variable: comma separated string of sources, with ~negation
  // returns an aggregation stage reflecting negatable source.source searches

  let sourcematch = {}
  let smatches = sourcelist.filter(e => e.charAt(0)!='~')
  let snegations = sourcelist.filter(e => e.charAt(0)=='~').map(x => x.substring(1))
  if(smatches.length > 0 && snegations.length > 0){
    sourcematch['source.source'] = {'$all': smatches, '$nin': snegations}
  } else if (smatches.length > 0){
    sourcematch['source.source'] = {'$all': smatches}
  } else if (snegations.length > 0){
    sourcematch['source.source'] = {'$nin': snegations}
  }

  return {$match: sourcematch}
}


