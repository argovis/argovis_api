const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;
const chai = require('chai');
chai.use(require('chai-json-schema'));
const rawspec = require('/tests/core-spec.json');
const $RefParser = require("@apidevtools/json-schema-ref-parser");

$RefParser.dereference(rawspec, (err, schema) => {
  if (err) {
    console.error(err);
  }
  else {
    
    describe("GET /timeseries/bsose", function () {
      it("make sure timeseries level filtering works as expected", async function () {
        const response = await request.get("/timeseries/bsose?presRange=50,100").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(5)  
      });
    });

    describe("GET /timeseries/bsose", function () {
      it("make sure timeseries level filtering and id matching dont conflict", async function () {
        const response = await request.get("/timeseries/bsose?id=0.083_-77.983_-65.000&presRange=50,100").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1)  
      });
    });
  }
})





