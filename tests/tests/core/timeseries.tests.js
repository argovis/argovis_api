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
    
    describe("GET /timeseries/noaasst", function () {
      it("make sure sst time slicing matches expectations", async function () {
        const response = await request.get("/timeseries/noaasst?center=-46.5,35.5&radius=1&startDate=1989-12-31T00:00:00Z&endDate=1990-01-28T00:00:00Z&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data).to.eql([[19.330000000000002,19.330000000000002,19.73,19.330000000000002]])        
      });
    });

    describe("GET /timeseries/copernicussla", function () {
      it("make sure sla time slicing matches expectations", async function () {
        const response = await request.get("/timeseries/copernicussla?center=-46.875,35.625&radius=1&startDate=1993-01-30T00:00:00Z&endDate=1993-02-14T00:00:00Z&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data).to.eql([[-0.12129999999999999, -0.02747142857142857],[0.2843428571428572, 0.37815714285714286]])        
      });
    });

    describe("GET /timeseries/ccmpwind", function () {
      it("make sure ccmp time slicing matches expectations", async function () {
        const response = await request.get("/timeseries/ccmpwind?center=0.125,0.125&radius=1&startDate=1993-01-30T00:00:00Z&endDate=1993-02-14T00:00:00Z&data=uwnd").set({'x-argokey': 'developer'});
        expect(response.body[0].data).to.eql([[0.9349232997213092, -0.9582493336472128]])        
      });
    });

    describe("GET /timeseries/noaasst", function () {
      it("allow noaa sst id request; shouldn't have timeseries appended", async function () {
        const response = await request.get("/timeseries/noaasst?id=-46.5_35.5&data=all").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(200);
        expect(response.body).to.be.jsonSchema(schema.paths['/timeseries/{timeseriesName}'].get.responses['200'].content['application/json'].schema); 
        expect(response.body[0]).not.to.have.property('timeseries')  
        expect(response.body[0].data[0].length).to.eql(1727)   
      });
    });

    describe("GET /timeseries/copernicussla", function () {
      it("allow copernicus sla id request; shouldn't have timeseries appended", async function () {
        const response = await request.get("/timeseries/copernicussla?id=-46.875_35.625&data=all").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(200);
        expect(response.body).to.be.jsonSchema(schema.paths['/timeseries/{timeseriesName}'].get.responses['200'].content['application/json'].schema);
        expect(response.body[0]).not.to.have.property('timeseries')
        expect(response.body[0].data[0].length).to.eql(1543) 
      });
    });

    describe("GET /timeseries/ccmpwind", function () {
      it("allow ccmp wind id request; shouldn't have timeseries appended", async function () {
        const response = await request.get("/timeseries/ccmpwind?id=0.125_0.125&data=all").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(200);
        expect(response.body).to.be.jsonSchema(schema.paths['/timeseries/{timeseriesName}'].get.responses['200'].content['application/json'].schema);
        expect(response.body[0]).not.to.have.property('timeseries')
        expect(response.body[0].data[0].length).to.eql(52) 
      });
    });

  }
})




