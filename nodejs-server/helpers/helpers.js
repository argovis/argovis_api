const geojsonArea = require('@mapbox/geojson-area');
const pipe = require('pipeline-pipe');
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

module.exports.request_sanitation = function(polygon, center, radius, multipolygon, data){
  // given some parameters from a requst, decide whether or not to reject; return false == don't reject, return with message / code if do reject

  // basic sanity checks
  if( (center && polygon) || (multipolygon && polygon) || (multipolygon && center)){
    return {"code": 400, "message": "Please request only one of polygon, center or multipolygon."} 
  }
  if((center && !radius) || (!center && radius)){
    return {"code": 400, "message": "Please specify both radius and center to filter for data less than <radius> km from <center>."}
  }

  return false
}

module.exports.datatable_stream = function(model, params, local_filter, projection, foreign_docs){
  // given <model>, a mongoose model pointing to a data collection,
  // <params> the return object from parameter_sanitization,
  // <local_filter> a custom set of aggregation pipeline steps to be applied to the data collection reffed by <model>,
  // <projection> a list of data document keys to project down to at the end of the search
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

  if(projection){
    // drop documents with no data before they come out of the DB, and project out only the listed data document keys
    aggPipeline.push({$match: {'data.0':{$exists:true}}})
    project = {}
    for(let i=0;i<projection.length;i++){
      project[projection[i]] = 1
    }
    aggPipeline.push({$project: project})
  }

  return model.aggregate(aggPipeline).cursor()
}

module.exports.combineDataInfo = function(dinfos){
  // <dinfos>: array of data_info objects, all with same set of columns
  // returns a single data_info object composed of all elements of input array
  let d = []
  d[0] = [].concat(...dinfos.map(x=>x[0]))
  d[1] = dinfos[0][1]
  d[2] = [].concat(...dinfos.map(x=>x[2]))
  return d
}

module.exports.postprocess_stream = function(chunk, metadata, pp_params, stub){
  // <chunk>: raw data table document
  // <metadata>: metadata doc corresponding to this chunk
  // <pp_params>: kv which defines level filtering, data selection and compression decisions
  // <stub>: function accepting one data document and its corresponding metadata document, returns appropriate representation for the compression=minimal flag.
  // returns chunk mutated into its final, user-facing form
  // or return false to drop this item from the stream

  // immediately return a minimal stub if requested and data has been projected off
  if(pp_params.compression == 'minimal' && !chunk.hasOwnProperty('data')){
    return stub(chunk, metadata)
  }

  // declare some variables at scope
  let keys = []       // data keys to keep when filtering down data
  let notkeys = []    // data keys that disqualify a document if present
  let coerced_pressure = false
  let metadata_only = false

  // delete junk parameters
  if(pp_params.junk){
    for(let i=0; i<pp_params.junk.length; i++){
      delete chunk[pp_params.junk[i]]
    }
  }

  // if chunk has no data recoreded, abandon
  if(chunk.data.length == 0){
    return false
  }

  // make sure metadata is sorted the same as chunk.metadata
  let m = []
  for(let i=0; i<chunk.metadata.length; i++){
    m.push(metadata.filter(x=>x._id==chunk.metadata[i])[0])
  }
  metadata = m

  // determine which data keys should be kept or tossed, if necessary
  if(pp_params.data){
    keys = pp_params.data.filter(e => e.charAt(0)!='~')
    notkeys = pp_params.data.filter(e => e.charAt(0)=='~').map(k => k.substring(1))
    if(keys.includes('except-data-values')){
      metadata_only = true
      keys.splice(keys.indexOf('except-data-values'))
    }
  }

  // identify data_keys
  let dk = null
  let dinfo = null
  if(chunk.hasOwnProperty('data_info')){
    dk = chunk.data_info[0]
    dinfo = chunk.data_info
  } else {
    dinfo = module.exports.combineDataInfo(metadata.map(x => x.data_info))
    dk = dinfo[0]
  }

  // bail out on this document if it contains any ~keys:
  if(dk.some(item => notkeys.includes(item))) return false

  // force return of pressure for anything that has a pressure data key
  if(dk.includes('pressure') && !keys.includes('pressure')){
    keys.push('pressure')
    coerced_pressure = true
  }

  // filter down to requested data
  if(pp_params.data && !keys.includes('all')){
    if(!chunk.hasOwnProperty('data_info')){
      chunk.data_info = dinfo
    }
    let keyset = JSON.parse(JSON.stringify(chunk.data_info[0]))
    // abandon profile if a requested data key is missing
    if(!keys.every(val => keyset.includes(val))){
      return false
    }
    for(let i=0; i<keyset.length; i++){
      let k = keyset[i]
      let kIndex = chunk.data_info[0].indexOf(k)
      if(!keys.includes(k)){
        // drop it if we didn't ask for it
        chunk.data.splice(kIndex,1)
        chunk.data_info[0].splice(kIndex,1)
        chunk.data_info[2].splice(kIndex,1)
      } else {
        // abandon profile if a requested measurement is all null
        if(chunk.data[kIndex].every(x => x === null)){
          return false
        }
      }
    }
    if(Object.keys(chunk.data).length === (coerced_pressure ? 1 : 0)){
      return false // deleted all our data, bail out
    }
  }

  // filter by presRange, drop profile if reqested and available pressures are disjoint
  /// identify level spectrum, could be <data doc>.data.pressure (for point data) or <metadata doc>.levels (for grids)
  let lvlSpectrum = []
  let pressure_index = dinfo[0].findIndex(x => x === 'pressure')
  if(pressure_index !== -1){
    lvlSpectrum = chunk.data[pressure_index]
  } else if(metadata[0].levels){
    lvlSpectrum = metadata[0].levels // note we take from metadata[0] since we're requiring all grids in the same collection have the same level spectrum
  }
  if(pp_params.presRange && lvlSpectrum.length > 0){
    let lowIndex = 0
    let highIndex = lvlSpectrum.length-1
    if(lvlSpectrum[0] > pp_params.presRange[1]){
      return false // requested pressure range that is completely shallower than pressures available
    }
    if(lvlSpectrum[highIndex] < pp_params.presRange[0]){
      return false // requested pressure range that is completely deeper than pressures available
    }
    while(lowIndex < highIndex && lvlSpectrum[lowIndex] < pp_params.presRange[0]){
      lowIndex++
    } // lowIndex now points at the first level index to keep
    while(highIndex > lowIndex && lvlSpectrum[highIndex] > pp_params.presRange[1]){
      highIndex--
    } // highIndex now points at the last level index to keep
    for(let i=0; i<Object.keys(chunk.data).length; i++){
      let k = Object.keys(chunk.data)[i]
      chunk.data[k] = chunk.data[k].slice(lowIndex, highIndex+1)
    }
    /// append levels to the data document if it has been filtered on 
    if(metadata[0] && metadata[0].levels) {
      chunk.levels = metadata[0].levels.slice(lowIndex, highIndex+1)
    }
  }

  // drop any level for which all requested measurements are null if specific data has been requested
  if(pp_params.data && pp_params.data != 'all'){
    let dcopy = JSON.parse(JSON.stringify(chunk.data))
    if(coerced_pressure){
      dcopy.splice(chunk.data_info[0].indexOf('pressure'),1)
    }

    dcopy = module.exports.zip(dcopy)

    dcopy = dcopy.map( (level,index) => {
      if(level.every(x => x === null)){
        return index
      } else{
        return -1
      }
    }).filter(x => x!==-1)

    /// bail out if every level is marked for deletion
    if(dcopy.length==chunk.data[0].length){
      return false
    }

    for(let i=0; i<chunk.data.length; i++){
      chunk.data[i] = chunk.data[i].filter((level, index) => {
        if(dcopy.includes(index)){
          return false
        } else {
          return true
        } 
      })
    }
  }

  // drop data on metadata only requests
  if(!pp_params.data || metadata_only){
    delete chunk.data
  }

  // return a minimal stub if requested
  if(pp_params.compression == 'minimal'){
    return stub(chunk, metadata)
  }

  return chunk
}

module.exports.post_xform = function(metaModel, pp_params, search_result, res, stub){
  let nDocs = 0
  let postprocess = pp_params.suppress_meta ? 
    pipe(async chunk => {
      // munge the chunk and push it downstream if it isn't rejected.
      let doc = null
      if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
          /// ie dont even bother with post if we've exceeded our mostrecent cap
          doc = module.exports.postprocess_stream(chunk, [], pp_params, stub)
      }
      if(doc){
        if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
          res.status(200)
          nDocs++
          return(doc)
        }
      }
      return null
    }, 8) :
    pipe(async chunk => {
      // wait on a promise to get this chunk's metadata back
      meta = await module.exports.locate_meta(chunk['metadata'], search_result[0], metaModel)
      // keep track of new metadata docs so we don't look them up twice
      for(let i=0; i<meta.length; i++){
        if(!search_result[0].find(x => x._id == meta[i]._id)) search_result[0].push(meta[i])
      }
      // munge the chunk and push it downstream if it isn't rejected.
      let doc = null
      if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
          /// ie dont even bother with post if we've exceeded our mostrecent cap
          doc = module.exports.postprocess_stream(chunk, meta, pp_params, stub)
      }
      if(doc){
        if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
          res.status(200)
          nDocs++
          return(doc)
        }
      }
      return null
    }, 8)  

  return postprocess
}

module.exports.meta_xform = function(res){
  // transform stream that only looks for 404s

  let postprocess = pipe(async chunk => {
    res.status(200)
    return(chunk)
  })
    
  return postprocess
}

module.exports.locate_meta = function(meta_ids, meta_list, meta_model){
  // <meta_ids>: array of ids of meta documents of interest
  // <meta_list>: current array of fetched meta docs
  // <meta_model>: collection model to go looking in
  // return a promise that resolves to the metadata record sought.
  
  let current_meta = meta_list.map(x => x.metadata)
  current_meta = [].concat(...current_meta)
  meta_needed = meta_ids.filter(x => !current_meta.includes(x))

  if(meta_needed.length === 0){
    return new Promise(function(resolve, reject){resolve([])})
  } else {
    return meta_model.find({"_id": {"$in": meta_needed}}).lean().exec()
  }
}

module.exports.token_xform = function(res){
  // transform stream for token validation

  let nDocs = 0
  const postprocess = new Transform({
    objectMode: true,
    transform(chunk, encoding, next){
      this.push({tokenValid: chunk.tokenValid > 0})
      nDocs++
      next()
    }
  });
  
  postprocess._flush = function(callback){
    if(nDocs == 0){
      this.push({tokenValid: false})
    }
    return callback()
  }

  return postprocess
}

module.exports.lookup_key = function(userModel, apikey, resolve, reject){
    // look up an apikey from mongo, and reject if not found or not valid.

    if(process.env.ARGOCORE === 'here'){
      // look for the key in mongo
      const query = userModel.find({key: apikey})
      query.exec(function(err, user){
        if (err){
            reject({"code": 500, "message": "Server error"});
            return;
        }
        if(user.length == 0){
            reject({"code": 401, "message": "Invalid user key."});
            return;
        }
        if(!user[0].toObject().tokenValid){
          reject({"code": 403, "message": "API token has been deactivated; please contact argovis@colorado.edu for assistance."})
          return;
        }
        
        resolve(user[0].toObject())
      })
    } else{
      // phone home to validate this key
      fetch(process.env.ARGOCORE + '/token?token='+apikey, {headers:{'x-argokey': apikey}})
              .then(response => response.json())
              .then(data => {
                if(data.hasOwnProperty('code') && data.code == 401){
                  reject({"code": 401, "message": "Invalid user key."});
                  return;
                } else {
                  resolve({key: apikey, tokenValid: data[0].tokenValid})
                }
              })
    }
}

module.exports.cost = function(url, c, cellprice, metaDiscount, maxbulk){
  // return the tokenbucket price for this URL.
  // c == defualt cost
  // cellprice == token cost of 1 sq deg day
  // metaDiscount == scaledown factor to discount except-data-values request by relative to data requests
  // maxbulk == maximum allowed size of ndays x area[sq km]/13000sqkm; set to prevent OOM crashes

  let earliest_records = {
    'argo': new Date("1997-07-28T20:26:20.002Z"),
    'cchdo': new Date("1972-07-24T09:11:00Z"),
    'drifters': new Date("1987-10-02T13:00:00Z"),
    'kg21': new Date("2005-01-15T00:00:00Z"),
    'rg09': new Date("2004-01-15T00:00:00Z"),
    'tc': new Date("1851-06-25T00:00:00Z"),
    "trajectories": new Date("2001-01-04T22:46:33Z"),
    "argone": new Date("1997-07-28T20:26:20.002Z") // artificial, set to apply same constraint as argo
  }

  let final_records = {
    'argo': new Date(),
    'cchdo': new Date("2021-08-13T23:27:00Z"),
    'drifters': new Date("2020-06-30T23:00:00Z"),
    'kg21': new Date("2020-12-15T00:00:00Z"),
    'rg09': new Date("2022-05-15T00:00:00Z"),
    'tc': new Date("2020-12-25T12:00:00Z"),
    'trajectories': new Date("2021-01-01T01:13:26Z"),
    'argone': new Date()
  }

  /// determine path steps
  let path = url.split('?')[0].split('/').slice(1)

  /// tokenize query string
  let qString = new URLSearchParams(url.split('?')[1]);

  /// handle standardized routes
  let standard_routes = ['argo', 'cchdo', 'drifters', 'tc', 'grids', 'argone', 'trajectories']

  if(standard_routes.includes(path[0])){
    //// metadata routes
    if(path.length==2 && path[1] == 'meta'){
      return 0.2
    }
    //// core data routes
    if(path.length==1 || (path[0]=='grids' && (path[1]=='rg09' || path[1]=='kg21'))){
      ///// any query parameter that specifies a particular record or small set of records can get waived through
      if(qString.get('id') || qString.get('wmo') || qString.get('name')){
        c = 1
      }

      //// query parameters that specify a larger but still circumscribed number of records
      else if(qString.get('woceline') || qString.get('cchdo_cruise') || qString.get('platform') || qString.get('metadata') ){
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
        params.endDate = params.endDate ? params.endDate : final_records[path[path.length-1]]

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
        console.log(err)
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

module.exports.find_grid_collection = function(token){
  // map a token including a grid's prefix ('rg09_temperature', 'rg09_salinity', ...) onto its collection name.

  if (["rg09_temperature", "rg09_salinity"].some(k => token.includes(k))) {
    return 'rg09'
  } else if(["kg21_ohc15to300"].some(k => token.includes(k))){
    return 'kg21'
  } else {
    return ''
  }
}