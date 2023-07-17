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
    
    describe("GET /noaasst", function () {
      it("make sure sst time slicing matches expectations", async function () {
        const response = await request.get("/noaasst?center=-46.5,35.5&radius=1&startDate=1989-12-31T00:00:00Z&endDate=1990-01-28T00:00:00Z&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data).to.eql([[19.330000000000002,19.330000000000002,19.73,19.330000000000002]])        
      });
    });

    describe("GET /copernicussla", function () {
      it("make sure sla time slicing matches expectations", async function () {
        const response = await request.get("/copernicussla?center=-46.875,35.625&radius=1&startDate=1993-01-30T00:00:00Z&endDate=1993-02-14T00:00:00Z&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data).to.eql([[-0.15601428571428572,-0.066],[0.2496428571428571,0.3396428571428572]])        
      });
    });


  }
})




