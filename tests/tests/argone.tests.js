const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;
const chai = require('chai');
chai.use(require('chai-json-schema'));
const rawspec = require('/tests/spec.json');
const $RefParser = require("@apidevtools/json-schema-ref-parser");

$RefParser.dereference(rawspec, (err, schema) => {
  if (err) {
    console.error(err);
  }
  else {
    describe("GET /argone", function () {
      it("returns one covariance grid result", async function () {
        const response = await request.get("/argone?forecastOrigin=-178,-44").set({'x-argokey': 'developer'});   
        expect(response.body).to.be.jsonSchema(schema.paths['/argone'].get.responses['200'].content['application/json'].schema);
        expect(response.body.length).to.eql(20)
      });
    });

    describe("GET /argone", function () {
      it("returns one covariance grid result with data=all", async function () {
        const response = await request.get("/argone?forecastOrigin=-178,-44&data=all").set({'x-argokey': 'developer'});   
        expect(response.body).to.be.jsonSchema(schema.paths['/argone'].get.responses['200'].content['application/json'].schema);
        expect(response.body.length).to.eql(20)
      });
    });

    describe("GET /argone", function () {
      it("metadata always == ['covariance'], even with multiple data keys", async function () {
        const response = await request.get("/argone?forecastOrigin=-178,-44&data=all").set({'x-argokey': 'developer'});   
        expect(response.body[0].metadata).to.eql(['argone'])
      });
    });

    describe("GET /argone", function () {
      it("returns one covariance grid result with data=all", async function () {
        const response = await request.get("/argone?forecastOrigin=-178,-44&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data).to.eql([ [ 0.11538461538461539 ], [ 0.05377610363734324 ], [ 0.030477499703864364 ], [ 0.018081056411537323 ], [ 0.01123815800521084 ], [ 0.007340254589296222 ], [ 0.005088014433266403 ], [ 0.003763789311441498 ], [ 0.0029577006246442254 ], [ 0.0024529171745545975 ], [ 0.0021225882833758093 ], [ 0.0018956428531083885 ], [ 0.001727359055017902 ], [ 0.0015998317597613408 ], [ 0.0014954935049800726 ], [ 0.001408923089337973 ], [ 0.001334794653985285 ], [ 0.001269476900788127 ], [ 0.0012104725610651962 ], [ 0.0011563930587330502 ] ])
      });
    });

    describe("GET /argone", function () {
      it("select correct data with data filter", async function () {
        const response = await request.get("/argone?id=-178_-44_-178.0_-44.0&data=180").set({'x-argokey': 'developer'});   
        expect(response.body[0].data).to.eql([[0.05377610363734324]])
        expect(response.body[0].data_info[0]).to.eql(['180'])
      });
    });

    describe("GET /argone", function () {
      it("returns one covariance grid result by id", async function () {
        const response = await request.get("/argone?id=-178_-44_-172.0_-44.0").set({'x-argokey': 'developer'});   
        expect(response.body).to.be.jsonSchema(schema.paths['/argone'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argone", function () {
      it("returns covariance data by destination coords", async function () {
        const response = await request.get("/argone?forecastGeolocation=-176,-44").set({'x-argokey': 'developer'});   
        expect(response.body).to.be.jsonSchema(schema.paths['/argone'].get.responses['200'].content['application/json'].schema);
        expect(response.body.length).to.eql(1)
      });
    });

    describe("GET /argone", function () {
      it("returns covariance data by destination coords with data filtering", async function () {
        const response = await request.get("/argone?forecastGeolocation=-176,-44&data=1800").set({'x-argokey': 'developer'});   
        expect(response.body).to.be.jsonSchema(schema.paths['/argone'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argone/meta", function () {
      it("returns covariance metadata result by id", async function () {
        const response = await request.get("/argone/meta?id=argone").set({'x-argokey': 'developer'});   
        expect(response.body).to.be.jsonSchema(schema.paths['/argone/meta'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argone/meta", function () {
      it("argone metadata 404", async function () {
        const response = await request.get("/argone/meta?id=xxx").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
        expect(response.body).to.eql({code: 404,message: "No float location metadata matching ID xxx; all float location metadata is stored in the single document id=argone"});
      });
    }); 
  }
})


