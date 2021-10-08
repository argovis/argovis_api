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
    describe("GET /selection/globalMapProfiles", function () {
      it("get global metadata over a time period", async function () {
        const response = await request.get("/selection/globalMapProfiles?startDate=2020-03-21T00:00:00Z&endDate=2020-03-22T00:00:00Z");    
        expect(response.body).to.be.jsonSchema(schema.paths['/selection/globalMapProfiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /selection/globalMapProfiles", function () {
      it("errors on too long a time interval", async function () {
        const response = await request.get("/selection/globalMapProfiles?startDate=2020-03-21T00:00:00Z&endDate=2020-03-24T00:00:01Z");    

        expect(response.status).to.eql(400);
      });
    });  
  }
})


