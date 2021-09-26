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
    describe("GET /griddedProducts/gridMetadata", function () {
      it("fetch grid metadata", async function () {
        const response = await request.get("/griddedProducts/gridMetadata?gridName=ksTempTrend2");    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/gridMetadata'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /griddedProducts/grid/window", function () {
      it("fetch grid window", async function () {
        const response = await request.get("/griddedProducts/grid/window?gridName=ksTempTrend2&presLevel=10&latRange=-52,-50&lonRange=21,22&date=2012-09-01T00:00:00Z");    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/grid/window'].get.responses['200'].content['application/json'].schema);
      });
    });

  }
})


