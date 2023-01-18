const Transform = require('stream').Transform;

module.exports = {}

module.exports.grid_postprocess_stream = function(chunk, metadata, pp_params, stub){
  // grid-specialized version of the postprocess_stream helper
  // recall structure is a bit different for `data`, effectively the transpose of the point data

  // <chunk>: raw data table document
  // <metadata>: full metadata table for this collection
  // <pp_params>: kv which defines level filtering, data selection and compression decisions
  // <stub>: function accepting one data document and its corresponding metadata document, returns appropriate representation for the compression=minimal flag.
  // returns chunk mutated into its final, user-facing form
  // or return false to drop this item from the stream
  // declare some variables at scope
  let keys = []       // data keys to keep when filtering down data
  let notkeys = []    // data keys that disqualify a document if present
  let metadata_only = false
  
  // determine which data keys should be kept or tossed, if necessary
  if(pp_params.data){
    if(keys.includes('except-data-values')){
      metadata_only = true
      keys.splice(keys.indexOf('except-data-values'))
    }
    keys = pp_params.data.filter(e => e.charAt(0)!='~')
    notkeys = pp_params.data.filter(e => e.charAt(0)=='~').map(k => k.substring(1))
  } else {
    keys = chunk.data_keys
  }

  // bail out on this document if it contains any ~keys:
  if(chunk.data_keys.some(item => notkeys.includes(item))) return false

  // drop non-requested grids, data_keys and corresponding adjacent data
  if(pp_params.data){
    for(let i=0; i<chunk.data_keys.length; i++){
      if(!keys.includes('all') && !keys.includes(chunk.data_keys[i])){
        chunk.data[i] = null
        chunk.data_keys[i] = null
        for(let k=0; k<pp_params.data_adjacent.length; k++){
          chunk[pp_params.data_adjacent[k]][i] = null
        }
      }
    }
    chunk.data = chunk.data.filter(x => x !== null)
    chunk.data_keys = chunk.data_keys.filter(x => x !== null)
    for(let k=0; k<pp_params.data_adjacent.length; k++){
      chunk[pp_params.data_adjacent[k]] = chunk[pp_params.data_adjacent[k]].filter(x => x !== null)
    }
  }

  // use presRange to identify per-grid index ranges, and filter appropriately
  if(pp_params.presRange){
    chunk.levels = []
    for(let i=0; i<chunk.data_keys.length; i++){
      // identify a range of level indexes for this grid
      let meta = metadata.filter(x => x._id == chunk.metadata[i])[0]
      let index_range = []
      index_range[0] = meta.levels.findIndex(n => n >= pp_params.presRange[0]);
      index_range[1] = meta.levels.length - meta.levels.reverse().findIndex(n => n <= pp_params.presRange[1]) - 1;
      meta.levels.reverse() // restore order
      if(index_range[0] == -1){
        index_range[0] = meta.levels.length
      }
      if(index_range[1] == meta.levels.length){  // ie meta.levels.length - -1 -1
        index_range[1] = -1 * meta.levels.length -1
      }
      // reduce data to levels of interest for this grid
      chunk.data[i] = chunk.data[i].slice(index_range[0], index_range[1]+1)
      // keep track of remaining levels for this grid
      chunk.levels[i] = meta.levels
      chunk.levels[i] = chunk.levels[i].slice(index_range[0], index_range[1]+1)
    }
  }
  
  // abandon doc if data was requested and no levels in any grid are left
  if(pp_params.data && chunk.data.every(x => x.length == 0)){
    return false
  }

  // drop data on metadata only requests
  if(!pp_params.data || metadata_only){
    delete chunk.data
    delete chunk.levels
  }

  // inflate data if requested
  if(!pp_params.compression && chunk.data){
    let d = {}
    for(let i=0; i<chunk.data_keys.length; i++){
      d[chunk.data_keys[i]] = chunk.data[i]
    }
    chunk.data = d
    for(let k=0; k<pp_params.data_adjacent.length; k++){
      let a = {}
      for(let i=0; i<chunk.data_keys.length; i++){
        a[chunk.data_keys[i]] = chunk[pp_params.data_adjacent[k]][i]
      }
      chunk[pp_params.data_adjacent[k]] = a
    }
    if(chunk.hasOwnProperty('levels')){
      let l = {}
      for(let i=0; i<chunk.data_keys.length; i++){
        l[chunk.data_keys[i]] = chunk.levels[i]
      }
      chunk.levels = l
    }
  }

  // return a minimal stub if requested
  if(pp_params.compression == 'minimal'){
    return stub(chunk, metadata)
  }

  return chunk
}

module.exports.grid_post_xform = function(pp_params, search_result, res, stub){
  // grid-specialized version of the post_xform helper function.
  let nDocs = 0
  const postprocess = new Transform({
    objectMode: true,
    transform(chunk, encoding, next){
      // munge the chunk and push it downstream if it isn't rejected.
      let doc = null
      if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
          /// ie dont even bother with post if we've exceeded our mostrecent cap
          doc = module.exports.grid_postprocess_stream(chunk, search_result[0], pp_params, stub)
      }
      if(doc){
        if(!pp_params.mostrecent || nDocs < pp_params.mostrecent){
          this.push(doc)
        }
        nDocs++
      }
      next()
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