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
    
    describe("GET /argotrajectories", function () {
      it("searches for trajectory records, dont request data", async function () {
        const response = await request.get("/argotrajectories?polygon=[[-27,4],[-29,4],[-29,6],[-27,6],[-27,4]]").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argotrajectories'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argotrajectories", function () {
      it("searches for trajectories with data=except-data-values", async function () {
        const response = await request.get("/argotrajectories?polygon=[[-27,4],[-29,4],[-29,6],[-27,6],[-27,4]]&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argotrajectories'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argotrajectories", function () {
      it("argotrajectories with data filter should return argotrajectories-consistent data", async function () {
        const response = await request.get("/argotrajectories?polygon=[[-27,4],[-29,4],[-29,6],[-27,6],[-27,4]]&data=velocity_zonal").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argotrajectories'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argotrajectories", function () {
      it("argotrajectories with data filter should return correct data_keys", async function () {
        const response = await request.get("/argotrajectories?polygon=[[-27,4],[-29,4],[-29,6],[-27,6],[-27,4]]&data=velocity_zonal").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.have.members(['velocity_zonal'])
      });
    });

    describe("GET /argotrajectories", function () {
      it("argotrajectories with data filter should return correct units", async function () {
        const response = await request.get("/argotrajectories?polygon=[[-27,4],[-29,4],[-29,6],[-27,6],[-27,4]]&data=velocity_zonal").set({'x-argokey': 'developer'});
        uindex = response.body[0].data_info[1].indexOf('units')
        expect(response.body[0].data_info[2][0][uindex]).to.eql("centimeters per second")
      });
    });

    describe("GET /argotrajectories", function () {
      it("argotrajectories with data=all filter should return argotrajectories-consistent data", async function () {
        const response = await request.get("/argotrajectories?id=13857_116&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argotrajectories'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /argotrajectories", function () {
      it("argotrajectories profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/argotrajectories?id=13857_120&data=velocity_zonal").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argotrajectories?startDate&endDate", function () {
      it("returns one trajectory result within the requested range", async function () {
        const response = await request.get("/argotrajectories?startDate=2001-01-08T17:35:31Z&endDate=2001-01-10T17:35:31Z").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argotrajectories'].get.responses['200'].content['application/json'].schema);   
      });
    });    

    describe("GET /argotrajectories?platform", function () {
      it("should be 5 records", async function () {
        const response = await request.get("/argotrajectories?platform=13857").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(5);  
      });
    });  

    describe("GET /argotrajectories/meta?", function () {
      it("should be 1 meta-record for platform 13857", async function () {
        const response = await request.get("/argotrajectories/meta?platform=13857").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);  
      });
    }); 

    describe("GET /argotrajectories/meta?id", function () {
      it("check argotrajectories meta schema", async function () {
        const response = await request.get("/argotrajectories/meta?platform=13857").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/argotrajectories/meta'].get.responses['200'].content['application/json'].schema); 
      });
    }); 

    describe("GET /argotrajectories/vocabulary", function () {
      it("check argotrajectories platform vocab", async function () {
        const response = await request.get("/argotrajectories/vocabulary?parameter=platform").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['13857']) 
      });
    });

    describe("GET /argotrajectories?metadata", function () {
      it("should be 5 data records corresponding to this metadata key", async function () {
        const response = await request.get("/argotrajectories?metadata=13857_m0").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(5);  
      });
    }); 

    describe("GET /argotrajectories", function () {
      it("should return appropriate minimal representation of this measurement", async function () {
        const response = await request.get("/argotrajectories?id=13857_116&compression=minimal").set({'x-argokey': 'developer'});
        expect(response.body).to.eql([['13857_116', ["13857_m0"], -28.744391, 5.435884, "2001-01-09T17:35:31.000Z"]]);  
      });
    }); 

    describe("GET /argotrajectories/meta", function () {
      it("should 404 on ID typos", async function () {
        const response = await request.get("/argotrajectories/meta?id=xxx").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /argotrajectories", function () {
      it("argotrajectories with no data filter should not inclde data_info on the data document", async function () {
        const response = await request.get("/argotrajectories?id=13857_116").set({'x-argokey': 'developer'});
        expect(response.body[0].hasOwnProperty('data_info')).to.eql(false);  
      });
    }); 
  }
})




