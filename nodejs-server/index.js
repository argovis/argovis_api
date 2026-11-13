'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var mongoose = require('mongoose');
var debug = require('debug')('app');
var serverPort = 8080;
var tokenbucket = require('./middleware/ratelimiter/tokenbucket')
const express = require('express');
const router = express.Router();
const promClient = require('prom-client');

// Create a prometheus histogram for request durations
const requestDurationHistogram = new promClient.Histogram({
    name: 'api_request_duration_seconds',
    help: 'Duration of API requests in seconds',
    labelNames: ['endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60] // Define bucket sizes for request duration (in seconds)
  });

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.'+process.env.ARGONODE+'.yaml'), options);
var app = expressAppConfig.getApp();

// custom middleware injection ///////////
/// /metrics endpoint for prometheus
app.use(router.get('/metrics', (req,res) => {
    res.set('Content-Type', promClient.register.contentType)
    promClient.register.metrics().then(data => res.send(data));
}))
app.use(tokenbucket.tokenbucket)
let stack = app._router.stack;
let lastEntries = stack.splice(app._router.stack.length - 2);  // since we're adding 2 custom middleware at this point
let firstEntries = stack.splice(0, 5); // adding our middleware after the first 5, arbitrary
app._router.stack = [...firstEntries, ...lastEntries, ...stack];

/// prometheus request duration middleware, needs to go right before the requests middleware
app.use((req, res, next) => {
  const end = requestDurationHistogram.startTimer({ endpoint: req.path });
  
  res.on('finish', () => {
    end({});
  });

  next();
});
stack = app._router.stack;
lastEntries = stack.splice(app._router.stack.length - 1);
const requestMiddlewareIndex = app._router.stack.findIndex(layer => layer.name === 'requestMiddleware');
firstEntries = stack.splice(0, requestMiddlewareIndex);
app._router.stack = [...firstEntries, ...lastEntries, ...stack];

// end custom middleware injection ///////////////

// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

// mongodb config and connection //////////////////
mongoose.Promise = global.Promise;
//const mongoDB = "mongodb://database1,database2,database3/argo?replicaSet=rsmongo&readPreference=secondary" // EV this later
const mongoDB = process.env.MONGOCONNECT //"mongodb://database/argo"
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAlive: true,
  connectTimeoutMS: 30000,
  maxPoolSize: 2
};

mongoose.connect(mongoDB, mongooseOptions)
.catch(error => { console.log('mongoose connect error: ', error.message); });

let db = mongoose.connection;
db.on('error', debug.bind(console, 'MongoDB connection error:'));
//////////////// end mongo config //////////////////