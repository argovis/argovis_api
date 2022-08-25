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
    
    describe("GET /tc", function () {
      it("searches for tc records, dont request data", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/tc'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /tc", function () {
      it("searches for tc profiles with data=metadata-only", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=metadata-only").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/tc'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /tc", function () {
      it("tc with data filter should return tc-consistent data", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=wind").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/tc'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /tc", function () {
      it("tc with data filter should return correct data_keys", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=wind").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members(['wind'])
      });
    });

    describe("GET /tc", function () {
      it("tc with data filter should return correct units", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=wind").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({'wind':"kt"})
      });
    });

    describe("GET /tc", function () {
      it("tc with data filter should return correct units, as a list when compressed", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=wind&compression=basic").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal(["kt"])
      });
    });

    describe("GET /tc", function () {
      it("tc with data=all filter should return tc-consistent data", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/tc'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /tc", function () {
      it("tc with data=all filter should return correct data_keys", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members(["wind","surface_pressure"])
      });
    });

    describe("GET /tc", function () {
      it("tc with data=all filter should return correct units", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({"wind":"kt", "surface_pressure":"mb"})
      });
    });

    describe("GET /tc", function () {
      it("tc profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=surface_pressure").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

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
  }
})

