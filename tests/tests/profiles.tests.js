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
    describe("GET /profiles", function () {
      it("searches for profiles by date", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z");
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });
  }
})