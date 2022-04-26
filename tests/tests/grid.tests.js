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
        response.body.shift() // first element is metadata, drop before cheking rest of schema
        expect(response.body).to.be.jsonSchema(schema.paths['/grids'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids", function () {
      it("complain about grid name typo", async function () {
        const response = await request.get("/grids?gridName=rgTempTota&polygon=[[20,-65],[20,-64],[22,-64],[22,-65],[20,-65]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z").set({'x-argokey': 'developer'});  
        expect(response.status).to.eql(400);
      });
    }); 

    describe("GET /grids", function () {
      it("fetch gridded data with pressure bracket", async function () {
        const response = await request.get("/grids?gridName=rgTempTotal&polygon=[[20,-65],[20,-64],[22,-64],[22,-65],[20,-65]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z&presRange=999,2000").set({'x-argokey': 'developer'});
        response.body.shift() // first element is metadata, drop before cheking rest of schema
        expect(response.body[0]['d']).to.eql( [ 0.621, 0.584, 0.549,  0.52, 0.489, 0.464, 0.441, 0.415, 0.383, 0.356, 0.309, 0.265, 0.219, 0.175, 0.128 ]);
      });
    });

  }
})

