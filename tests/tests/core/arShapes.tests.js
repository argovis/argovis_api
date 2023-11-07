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
    // describe("GET /ar", function () {
    //   it("returns one atmo river result", async function () {
    //     const response = await request.get("/ar").set({'x-argokey': 'developer'});
    //     expect(response.body).to.be.jsonSchema(schema.paths['/ar'].get.responses['200'].content['application/json'].schema);
    //   });
    // });

    // describe("GET /ar?date", function () {
    //   it("returns one atmo river result", async function () {
    //     const response = await request.get("/ar?date=2010-01-01T00:00:00Z").set({'x-argokey': 'developer'});
    //     expect(response.body).to.be.jsonSchema(schema.paths['/ar'].get.responses['200'].content['application/json'].schema);
    //   });
    // });

    describe("GET /ar?_id", function () {
      it("returns one atmo river result", async function () {
        const response = await request.get("/ar?_id=2000.01.01.03.0_5").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/extended/{extendedName}'].get.responses['200'].content['application/json'].schema);
      });
    });
  }
})