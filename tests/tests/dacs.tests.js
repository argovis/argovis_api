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

    describe("GET /dacs", function () {
      it("summarizes dacs across the profile collection", async function () {
        const response = await request.get("/dacs");
        expect(response.body).to.be.jsonSchema(schema.paths['/dacs'].get.responses['200'].content['application/json'].schema);   
      });
    }); 
  }
})