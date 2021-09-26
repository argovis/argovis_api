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
    describe("GET /tc", function () {
      it("returns one tropical cyclone result", async function () {
        const response = await request.get("/tc");
        expect(response.body).to.be.jsonSchema(schema.components.schemas.tcSchema);
      });
    });    

    describe("GET /tc/findByDate", function () {
      it("returns one tropical cyclone result", async function () {
        const response = await request.get("/tc/findByDate?date=2018-08-26T12:00:00.000Z");
        expect(response.body).to.be.jsonSchema(schema.paths['/tc/findByDate'].get.responses['200'].content['application/json'].schema);
      });
    });    

    describe("GET /tc/findByDate", function () {
      it("fails to find anything in the db", async function () {
        const response = await request.get("/tc/findByDate?date=2017-08-26T12:00:00.000Z");
        expect(response.status).to.eql(404);    
      });
    });    

    describe("GET /tc/findByDateRange", function () {
      it("returns one tropical cyclone result completely within the requested range", async function () {
        const response = await request.get("/tc/findByDateRange?startDate=2018-07-13T12:00:00Z&endDate=2018-09-13T12:00:00Z");
        expect(response.body).to.be.jsonSchema(schema.paths['/tc/findByDateRange'].get.responses['200'].content['application/json'].schema);   
      });
    });    

    describe("GET /tc/findByDateRange", function () {
      it("returns one tropical cyclone result beginning within the requested range", async function () {
        const response = await request.get("/tc/findByDateRange?startDate=2018-08-15T12:00:00Z&endDate=2018-10-13T12:00:00Z");
        expect(response.body).to.be.jsonSchema(schema.paths['/tc/findByDateRange'].get.responses['200'].content['application/json'].schema); 
      });
    });    

    describe("GET /tc/findByDateRange", function () {
      it("returns one tropical cyclone result ending within the requested range", async function () {
        const response = await request.get("/tc/findByDateRange?startDate=2018-06-13T12:00:00Z&endDate=2018-08-15T12:00:00Z");
        expect(response.body).to.be.jsonSchema(schema.paths['/tc/findByDateRange'].get.responses['200'].content['application/json'].schema);   
      });
    });    

    describe("GET /tc/findByDateRange", function () {
      it("range does not include cyclone", async function () {
        const response = await request.get("/tc/findByDateRange?startDate=2018-06-13T12:00:00Z&endDate=2018-06-13T15:00:00Z");
        expect(response.status).to.eql(404);    
      });
    });    

    describe("GET /tc/findByDateRange", function () {
      it("request rejected for being too long", async function () {
        const response = await request.get("/tc/findByDateRange?startDate=2018-06-13T12:00:00Z&endDate=2018-10-13T15:00:00Z");
        expect(response.status).to.eql(400);    
      });
    });    

    describe("GET /tc/stormNameList", function () {
      it("fetch a list of storm names", async function () {
        const response = await request.get("/tc/stormNameList");
        expect(response.body).to.be.jsonSchema(schema.paths['/tc/stormNameList'].get.responses['200'].content['application/json'].schema);   
      });
    });    
  }
})

