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

	hgetallAsync(req.headers['x-argokey'])
	.then(userbucket => {
		let d = new Date()
		let t = d.getTime()
		if(userbucket == null){
      // need to go find key in mongo and populate redis
      return new Promise(lookup.bind(null, req.headers['x-argokey']))
      	.then(user => {hsetAsync(user.key, "ntokens", bucketsize, "lastUpdate", t)})
      	.then(() => {return {"key": req.headers['x-argokey'], "ntokens": bucketsize, "lastUpdate": t}})
		} else {
			return {"key": req.headers['x-argokey'], "ntokens": Number(userbucket.ntokens), "lastUpdate": Number(userbucket.lastUpdate)}
		}
	})
	.then(userbucket => {
		let d = new Date()
		let t = d.getTime()
		let tokensnow = Math.min(userbucket.ntokens + Math.round((t - userbucket.lastUpdate)/tokenrespawntime), bucketsize)
		if(tokensnow > 0){
			hsetAsync(userbucket.key, "ntokens", Math.max(tokensnow-1,0), "lastUpdate", t).then(next())
		} else {
			throw({"code": 403, "message": "You have temporarily exceeded your API request limit. Try limiting your requests to small bursts, or one / second long term."})
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
    	if(!user[0].toObject().tokenvalid){
    		reject({"code": 403, "message": "API token not valid - did you confirm your email address?"})
    		return;
    	}
    
    	resolve(user[0].toObject())
  	})
}
