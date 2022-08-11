'use strict'
var utils = require('../../utils/writer.js');
var redis = require('redis');
const helpers = require('../../service/helpers')
const client = redis.createClient(6379, 'redis');
const util = require("util");
const getAsync = util.promisify(client.get).bind(client);
const setAsync = util.promisify(client.set).bind(client);
const hgetAsync = util.promisify(client.hget).bind(client);
const hgetallAsync = util.promisify(client.hgetall).bind(client);
const hsetAsync = util.promisify(client.hset).bind(client);
const user = require('../../models/user');
const geojsonArea = require('@mapbox/geojson-area');

module.exports = {}

module.exports.tokenbucket = function (req, res, next) {
	let bucketsize = 100
	let tokenrespawntime = 1000 // ms to respawn one token
	let requestCost = 1 //default cost, for metadata-only requests
	let argokey = 'guest'
	if(req.headers['x-argokey']){
		argokey = req.headers['x-argokey']
	}

	// allow all requests to docs
	if(req['url'] == '/docs/'){
		next()
		return
	}

	hgetallAsync(argokey)
	.then(userbucket => {
		let d = new Date()
		let t = d.getTime()
		if(userbucket == null){
     		// need to go find key in mongo and populate redis
      		return new Promise(lookup.bind(null, argokey))
      		.then(user => {hsetAsync(user.key, "ntokens", bucketsize, "lastUpdate", t, "superuser", user.tokenValid==9999)})
      		.then(() => {return {"key": argokey, "ntokens": bucketsize, "lastUpdate": t, "superuser": user.tokenValid==9999}})
		} else {
			// found the user's usage data in redis and can just hand it back.
			return {"key": argokey, "ntokens": Number(userbucket.ntokens), "lastUpdate": Number(userbucket.lastUpdate), "superuser": userbucket.superuser==='true'}
		}
	})
	.then(userbucket => {
		if(userbucket.superuser) {
			next()
			return
		}
		let d = new Date()
		let t = d.getTime()
		let tokensnow = Math.min(userbucket.ntokens + Math.round((t - userbucket.lastUpdate)/tokenrespawntime), bucketsize)
		requestCost = cost(req['url'])
		if(requestCost.hasOwnProperty('code')){
			throw(requestCost)
		}
		else if(tokensnow >= 0){
			hsetAsync(userbucket.key, "ntokens", tokensnow-requestCost, "lastUpdate", t).then(next())
		} else {
			throw({"code": 429, "message": "You have temporarily exceeded your API request limit. Try again in a minute, but limit your requests to small bursts, or wait a few seconds between requests long term."})
		}
	})
	.catch(err => {
		utils.writeJson(res, err, err.code);
	})
}

// helpers //////////////////
let lookup = function(apikey, resolve, reject){
	  // look up an apikey from mongo, and reject if not found or not valid.
  	const query = user.find({key: apikey})
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

let cost = function(url){
	// return the tokenbucket price for this URL.

	let c = 1 // default cost
	let cellprice = 0.001 // token cost of 1 sq deg day
	let metaDiscount = 100 // scaledown factor to discount metadata-only request by relative to data requests

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

			///// parameter cleaning and coercing
			let params = helpers.parameter_sanitization(null,qString.get('startDate'),qString.get('endDate'),qString.get('polygon'),qString.get('multipolygon'),qString.get('center'),qString.get('radius'))
			if(params.hasOwnProperty('code')){
				return params
			}
            params.startDate = params.startDate ? params.startDate : earliest_records[path[path.length-1]]
            params.endDate = params.endDate ? params.endDate : Date()

            ///// decline requests that are too geographically enormous
            let checksize = maxgeo(params.polygon, params.multipolygon, params.center, params.radius)
            if(checksize.hasOwnProperty('code')){
            	return checksize
            }

            ///// cost out request
            let geospan = geoarea(polygon,multipolygon,radius) / 13000 // 1 sq degree is about 13k sq km at eq
            let dayspan = Math.round(Math.abs((parmas.endDate - params.startDate) / (24*60*60*1000) )); // n days of request

            c = geospan*dayspan*cellprice

            ///// metadata discount
            if(!url.includes('data') || url.includes('metadata-only')){
            	c /= metaDiscount
            }

		}
		//// */meta and */vocabulary routes unconstrained for now  
	}

	/// all other routes unconstrained for now

    return c
}

let maxgeo = function(polygon, multipolygon, center, radius){
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
    if(multipolygon){
    	if(multipolygon.every(p => geojsonArea.geometry(p) > maxgeosearch)){
    		return {"code": 400, "message": "All Multipolygon regions are too big; at least one of them must be 45 M square km or less, or about 60 deg x 60 deg at the equator."}
    	}
    }

    return 0
}

let geoarea = function(polygon, multipolygon, radius){
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
