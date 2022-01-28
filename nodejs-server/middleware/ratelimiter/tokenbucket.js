'use strict'
var utils = require('../../utils/writer.js');
var redis = require('redis');
const client = redis.createClient(6379, 'redis');
const util = require("util");
const getAsync = util.promisify(client.get).bind(client);
const setAsync = util.promisify(client.set).bind(client);
const hgetAsync = util.promisify(client.hget).bind(client);
const hgetallAsync = util.promisify(client.hgetall).bind(client);
const hsetAsync = util.promisify(client.hset).bind(client);
const user = require('../../models/user');

module.exports = {}

module.exports.tokenbucket = function (req, res, next) {

	let bucketsize = 10
	let tokenrespawntime = 1000
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
		if(tokensnow > 0){
			hsetAsync(userbucket.key, "ntokens", Math.max(tokensnow-1,0), "lastUpdate", t).then(next())
		} else {
			throw({"code": 403, "message": "You have temporarily exceeded your API request limit. Try again in a minute, but limit your requests to small bursts, or one request per second long term."})
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
