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
const summaryModel = require('../../models/summary');
const promclient = require('prom-client');
const user = require('../../models/user');

module.exports = {}

const incomingRequestCounter = new promclient.Counter({
	name: 'incoming_requests',
	help: 'Number of incoming HTTP requests',
	labelNames: ['endpoint'],
});

const denyCounter = new promclient.Counter({
	name: 'requests_denied',
	help: 'Number of incoming HTTP requests rejected due to malformed input (400), ginormous tempotospatial extent (413), or throttling (429)',
	labelNames: ['endpoint', 'code'],
});

module.exports.tokenbucket = function (req, res, next) {
	// immediately count incoming requests
	incomingRequestCounter.inc({ endpoint: req.path });
	let bucketsize = 100
	let tokenrespawntime = 500 // ms to respawn one token
	let requestCost = 1 //default cost, for except-data-values requests
	let cellprice = 0.0001 // token cost of 1 sq deg day
	let metaDiscount = 100 // scaledown factor to discount except-data-values request by relative to data requests
	let maxbulk = 2000000 // maximum allowed size of ndays x area[sq km]/13000sqkm; set to prevent OOM crashes
	let maxbulk_timeseries = 225 // maximum allowed size of area[sq km]/13000sqkm for timeseries; set to prevent OOM crashes
	let argokey = 'guest'
	if(req.headers['x-argokey']){
		argokey = req.headers['x-argokey']
	}

	// allow all requests to docs
	if(req['url'] == '/docs/' || req['url'] == '/favicon.ico'){
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
        return summaryModel.find({_id: 'ratelimiter'}).lean().then(summaries => {
            return [userbucket, summaries[0]]
        })
    })
	.then(data => {
        let userbucket = data[0]
        let summaries = data[1]
		if(userbucket.superuser) {
			next()
			return
		}
		let d = new Date()
		let t = d.getTime()
		let tokensnow = Math.min(userbucket.ntokens + Math.round((t - userbucket.lastUpdate)/tokenrespawntime), bucketsize)
		requestCost = helpers.cost(req['url'], requestCost, cellprice, metaDiscount, maxbulk, maxbulk_timeseries, summaries)
		if(requestCost.hasOwnProperty('code')){
			hsetAsync(userbucket.key, "ntokens", tokensnow-1, "lastUpdate", t) // penalize spamming us with bad requests a little
			denyCounter.inc({ endpoint: req.path, code: requestCost.code });
			throw(requestCost)
		}
		else if(tokensnow >= 0){
			hsetAsync(userbucket.key, "ntokens", tokensnow-requestCost, "lastUpdate", t).then(next())
		} else {
			console.log('request rejected on token bucket:', req['url'], tokensnow)
			denyCounter.inc({ endpoint: req.path, code: 429 });
			throw({"code": 429, delay: [-1*tokensnow, requestCost], "message": "You have temporarily exceeded your API request limit. You will be able to issue another request in "+String(-1*tokensnow)+" seconds. Long term, requests like the one you just made can be made every "+String(requestCost)+" seconds."})
		}
	})
	.catch(err => {
		utils.writeJson(res, err, err.code);
	})
}
