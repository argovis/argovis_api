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
    describe("GET /covarGrid", function () {
      it("returns one covar grid result", async function () {
        const response = await request.get("/covarGrid?lat=-58&lon=98&forcastDays=140").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/covarGrid'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /covarGrid", function () {
      it("errors on invalid lat", async function () {
        const response = await request.get("/covarGrid?lat=98&lon=-58&forcastDays=140").set({'x-argokey': 'developer'});    

        expect(response.status).to.eql(400);
      });
    });    

    describe("GET /covarGrid", function () {
      it("returns a 404", async function () {
        const response = await request.get("/covarGrid?lat=0&lon=0&forcastDays=240").set({'x-argokey': 'developer'});    

        expect(response.status).to.eql(404);
      });
    });

    describe("GET /covarSum", function () {
      it("sums up part of a covar grid", async function () {
        const response = await request.get("/covarSum?lon=98&lat=-58&forcastDays=140&polygon=[[-56.2,99],[-55.8,99],[-55.8,103],[-56.2,103],[-56.2,99]]").set({'x-argokey': 'developer'});    

        expect(response.body.sum).to.eql(0.14285714285714285+0.07142857142857142);
      });
    });
  }
})


