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
    describe("GET /covarGrid/-58/98/140", function () {
      it("returns one covar grid result", async function () {
        const response = await request.get("/covarGrid?lat=-58&lon=98&forcastDays=140");    
        expect(response.body).to.be.jsonSchema(schema.paths['/covarGrid'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /covarGrid/98/-58/140", function () {
      it("errors on invalid lat", async function () {
        const response = await request.get("/covarGrid?lat=98&lon=-58&forcastDays=140");    

        expect(response.status).to.eql(400);
      });
    });    

    describe("GET /covarGrid/0/0/240", function () {
      it("returns a 404", async function () {
        const response = await request.get("/covarGrid?lat=0&lon=0&forcastDays=240");    

        expect(response.status).to.eql(404);
      });
    });
  }
})


