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

    describe("GET /summary", function () {
      it("check a basic summary fetch", async function () {
        const response = await request.get("/summary?id=example").set({'x-argokey': 'developer'});
        expect(response.body[0]).to.deep.equal({"_id": "example", "summary": {"demo":[1,2,3,4]}})
      });
    });
  }
})




