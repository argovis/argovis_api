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
    describe("GET /easyocean?woceline&section_start_date", function () {
      it("returns the data documents associated with a particular occupancy of a particular woceline", async function () {
        const response = await request.get("/easyocean?woceline=SR04&section_start_date=2010-12-24T00:00:00Z").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(5)
        expect(response.body).to.be.jsonSchema(schema.paths['/easyocean'].get.responses['200'].content['application/json'].schema);
      });
    });
  }
})