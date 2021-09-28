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
    describe("GET /selection", function () {
      it("get a few profiles by ID", async function () {
        const response = await request.get("/selection?presRange=10,20&ids=4902911_0,4902911_107");    
        expect(response.body).to.be.jsonSchema(schema.paths['/selection'].get.responses['200'].content['application/json'].schema);
      });
    });
  }
})


