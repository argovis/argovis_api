'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var mongoose = require('mongoose');
var debug = require('debug')('app');
var serverPort = 8080;
var tokenbucket = require('./middleware/ratelimiter/tokenbucket')

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();

// custom middleware injection ///////////
app.use(tokenbucket.tokenbucket)
const stack = app._router.stack;
const lastEntries = stack.splice(app._router.stack.length - 1);  // since we're adding 1 custom middleware
const firstEntries = stack.splice(0, 15); // adding our middleware after the first 15, tbd constraints (putting it after the first 5-10 breaks /docs)
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
const mongoDB = "mongodb://database/argo"
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
