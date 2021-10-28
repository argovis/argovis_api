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

    describe("GET /platforms", function () {
      it("gets metadata for a platform", async function () {
        const response = await request.get("/platforms?platform=4902911").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/platforms'].get.responses['200'].content['application/json'].schema);   
      });
    }); 

    describe("GET /platforms/mostRecent", function () {
      it("provides recent status info for each platform", async function () {
        const response = await request.get("/platforms/mostRecent").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/platforms/mostRecent'].get.responses['200'].content['application/json'].schema);   
      });
    });

    describe("GET /platforms/bgcList", function () {
      it("lists all platforms that provide BGC data", async function () {
        const response = await request.get("/platforms/bgcList").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/platforms/bgcList'].get.responses['200'].content['application/json'].schema);   
      });
    });
  }
})