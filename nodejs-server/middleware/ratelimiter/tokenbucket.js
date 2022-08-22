'use strict'
var utils = require('../../utils/writer.js');
var redis = require('redis');
const helpers = require('../../helpers/helpers')
const client = redis.createClient(6379, 'redis');
const util = require("util");
const getAsync = util.promisify(client.get).bind(client);
const setAsync = util.promisify(client.set).bind(client);
const hgetAsync = util.promisify(client.hget).bind(client);
const hgetallAsync = util.promisify(client.hgetall).bind(client);
const hsetAsync = util.promisify(client.hset).bind(client);
const userModel = require('../../models/user');
const geojsonArea = require('@mapbox/geojson-area');

module.exports = {}

module.exports.tokenbucket = function (req, res, next) {
	let bucketsize = 100
	let tokenrespawntime = 1000 // ms to respawn one token
	let requestCost = 1 //default cost, for metadata-only requests
	let cellprice = 0.0001 // token cost of 1 sq deg day
	let metaDiscount = 100 // scaledown factor to discount metadata-only request by relative to data requests
	let maxbulk = 1000000 // maximum allowed size of ndays x area[sq km]/13000sqkm; set to prevent OOM crashes
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
      		return new Promise(helpers.lookup_key.bind(null, userModel, argokey))
      		.then(user => {
      			hsetAsync(user.key, "ntokens", bucketsize, "lastUpdate", t, "superuser", user.tokenValid==9999)
      			return {"key": argokey, "ntokens": bucketsize, "lastUpdate": t, "superuser": user.tokenValid==9999}
      		})
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
		requestCost = helpers.cost(req['url'], requestCost, cellprice, metaDiscount, maxbulk)
		if(requestCost.hasOwnProperty('code')){
			throw(requestCost)
		}
		else if(tokensnow >= 0){
			hsetAsync(userbucket.key, "ntokens", tokensnow-requestCost, "lastUpdate", t).then(next())
		} else {
			throw({"code": 429, "message": "You have temporarily exceeded your API request limit. You will be able to issue another request in "+String(-1*tokensnow)+" seconds. Long term, requests like the one you just made can be made every "+String(requestCost)+" seconds."})
		}
	})
	.catch(err => {
		utils.writeJson(res, err, err.code);
	})
}
