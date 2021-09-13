'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var mongoose = require('mongoose');
var debug = require('debug')('app');
var serverPort = 8080;

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();

// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

// mongodb config and connection //////////////////
mongoose.Promise = global.Promise;
const mongoDB = "mongodb://database/argo" // EV this later
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAlive: 1,
  connectTimeoutMS: 30000
};

mongoose.connect(mongoDB, mongooseOptions)
.catch(error => { console.log('mongoose connect error: ', error.message); });

let db = mongoose.connection;
db.on('error', debug.bind(console, 'MongoDB connection error:'));
//////////////// end mongo config //////////////////