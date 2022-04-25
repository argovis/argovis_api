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
    describe("GET /grids", function () {
      it("fetch gridded data", async function () {
        const response = await request.get("/grids?gridName=rgTempTotal&polygon=[[20,-65],[20,-64],[22,-64],[22,-65],[20,-65]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids", function () {
      it("complain about grid name typo", async function () {
        const response = await request.get("/grids?gridName=rgTempTota&polygon=[[20,-65],[20,-64],[22,-64],[22,-65],[20,-65]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z").set({'x-argokey': 'developer'});  
        expect(response.status).to.eql(400);
      });
    });    
  }
})


