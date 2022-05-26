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
    describe("GET /drifters", function () {
      it("basic fetching drifter data", async function () {
        const response = await request.get("/drifters?startDate=2012-03-16T00:00:00Z&endDate=2012-03-17T00:00:00Z").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/drifters'].get.responses['200'].content['application/json'].schema);
      });
    });    

    describe("GET /drifters/meta", function () {
      it("basic fetching drifter metadata", async function () {
        const response = await request.get("/drifters/meta?wmo=1300915").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/drifters/meta'].get.responses['200'].content['application/json'].schema);
      });
    });  

    describe("GET /drifters/vocabulary", function () {
      it("fetch possible drifter WMOs", async function () {
        const response = await request.get("/drifters/vocabulary?parameter=wmo").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members([1300915, 5500930])
      });
    });     

    describe("GET /drifters", function () {
      it("fetch drifter data with a polygon filter", async function () {
        const response = await request.get("/drifters?polygon=[[-18,14],[-17,14],[-17,15],[-18,15],[-18,14]]").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(10);
      });
    }); 

    describe("GET /drifters", function () {
      it("fetch drifter data with a multipolygon filter", async function () {
        const response = await request.get("/drifters?multipolygon=[[[-18,14],[-17,14],[-17,15],[-18,15],[-18,14]],[[-18,14],[-17,14],[-17,14.8],[-18,14.8],[-18,14]]]").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(6);
      });
    }); 

    describe("GET /drifters", function () {
      it("fetch drifter data via a cross reference with drifter metadata", async function () {
        const response = await request.get("/drifters?wmo=5500930").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(10);
      });
    }); 
  }
})

