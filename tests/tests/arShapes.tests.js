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
    describe("GET /arShapes", function () {
      it("returns one atmo river result", async function () {
        const response = await request.get("/arShapes");
        expect(response.body).to.be.jsonSchema(schema.paths['/arShapes'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /arShapes/findByDate", function () {
      it("returns one atmo river result", async function () {
        const response = await request.get("/arShapes/findByDate?date=2010-01-01T00:00:00Z");
        expect(response.body[0]).to.be.jsonSchema(schema.paths['/arShapes/findByDate'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /arShapes/findByID", function () {
      it("returns one atmo river result", async function () {
        const response = await request.get("/arShapes/findByID?_id=3_262992");
        expect(response.body[0]).to.be.jsonSchema(schema.paths['/arShapes/findByID'].get.responses['200'].content['application/json'].schema);
      });
    });
  }
})