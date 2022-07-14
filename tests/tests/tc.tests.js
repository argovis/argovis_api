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
    
    describe("GET /tc?startDate&endDate", function () {
      it("returns one tropical cyclone result within the requested range", async function () {
        const response = await request.get("/tc?startDate=1851-06-24T23:00:00Z&endDate=1851-06-25T01:00:00Z&data=wind").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/tc'].get.responses['200'].content['application/json'].schema);   
      });
    });    

    describe("GET /tc?name", function () {
      it("should be 4 records for the DEMO TC", async function () {
        const response = await request.get("/tc?name=DEMO").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(4);  
      });
    });  

    describe("GET /tc/meta?name", function () {
      it("should be 1 meta-record for the DEMO TC", async function () {
        const response = await request.get("/tc/meta?name=DEMO").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);  
      });
    }); 

    describe("GET /tc/meta?id", function () {
      it("check tc meta schema", async function () {
        const response = await request.get("/tc/meta?id=AL011851").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/tc/meta'].get.responses['200'].content['application/json'].schema); 
      });
    }); 

    describe("GET /tc/vocabulary", function () {
      it("check tc vocab", async function () {
        const response = await request.get("/tc/vocabulary?parameter=name").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['DEMO', 'UNNAMED']) 
      });
    }); 

    // describe("GET /tc/stormNameList", function () {
    //   it("fetch a list of storm names", async function () {
    //     const response = await request.get("/tc/stormNameList").set({'x-argokey': 'developer'});
    //     expect(response.body).to.be.jsonSchema(schema.paths['/tc/stormNameList'].get.responses['200'].content['application/json'].schema);   
    //   });
    // });  
  }
})

