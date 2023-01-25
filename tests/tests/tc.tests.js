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
      it("searches for tc profiles with data=except-data-values", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=except-data-values").set({'x-argokey': 'developer'});
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
        expect(response.body[0].data_info[0]).to.have.members(['wind'])
      });
    });

    describe("GET /tc", function () {
      it("tc with data filter should return correct units", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=wind").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[2][0][0]).to.eql("kt")
      });
    });

    describe("GET /tc", function () {
      it("tc with data=all filter should return tc-consistent data", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/tc'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /tc", function () {
      it("tc with data filter should return correct data_keys", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=wind,surface_pressure").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.have.members(["wind","surface_pressure"])
      });
    });

    describe("GET /tc", function () {
      it("tc with data filter should return correct units", async function () {
        const response = await request.get("/tc?polygon=[[-94,27.5],[-95,27.5],[-95,28.5],[-94,28.5],[-94,27.5]]&data=wind,surface_pressure").set({'x-argokey': 'developer'});
        iWind = response.body[0].data_info[0].indexOf('wind')   
        iPressure = response.body[0].data_info[0].indexOf('surface_pressure')        
        expect(response.body[0].data_info[2][iWind][0]).to.deep.equal("kt")
        expect(response.body[0].data_info[2][iPressure][0]).to.deep.equal("mb")
      });
    });

    describe("GET /tc", function () {
      it("tc profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/tc?id=AL041851_18510816180000&data=surface_pressure").set({'x-argokey': 'developer'});
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
        console.log(response.body[0])
        expect(response.body).to.be.jsonSchema(schema.paths['/tc/meta'].get.responses['200'].content['application/json'].schema); 
      });
    }); 

    describe("GET /tc/vocabulary", function () {
      it("check tc name vocab", async function () {
        const response = await request.get("/tc/vocabulary?parameter=name").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['DEMO', 'UNNAMED']) 
      });
    });

    describe("GET /tc/vocabulary", function () {
      it("check tc metadata vocab", async function () {
        const response = await request.get("/tc/vocabulary?parameter=metadata").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['AL011851', 'AL041851']) 
      });
    });

    describe("GET /tc/vocabulary", function () {
      it("check tc data_keys vocab", async function () {
        const response = await request.get("/tc/vocabulary?parameter=data_keys").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(["surface_pressure", "wind"]) 
      });
    });

    describe("GET /tc?metadata", function () {
      it("should be 5 data records corresponding to this metadata key", async function () {
        const response = await request.get("/tc?metadata=AL011851").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(5);  
      });
    }); 

    describe("GET /tc", function () {
      it("should return appropriate minimal representation of this measurement", async function () {
        const response = await request.get("/tc?id=AL011851_18510625000000&compression=minimal").set({'x-argokey': 'developer'});
        expect(response.body).to.eql([['AL011851_18510625000000', -94.8, 28, "1851-06-25T00:00:00.000Z"]]);  
      });
    }); 

    describe("GET /tc/meta", function () {
      it("should 404 on ID typos", async function () {
        const response = await request.get("/tc/meta?id=xxx").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
        expect(response.body).to.eql([{"code": 404,"message": "No documents found matching search."}])
      });
    });

    describe("GET /tc", function () {
      it("tc with no data filter should not inclde data_keys on the data document", async function () {
        const response = await request.get("/tc?id=AL011851_18510625000000").set({'x-argokey': 'developer'});
        expect(response.body[0].hasOwnProperty('data_keys')).to.eql(false);  
      });
    }); 

    describe("GET /tc", function () {
      it("tc with no data filter should not inclde units on the data document", async function () {
        const response = await request.get("/tc?id=AL011851_18510625000000").set({'x-argokey': 'developer'});
        expect(response.body[0].hasOwnProperty('units')).to.eql(false);  
      });
    }); 
  }
})




