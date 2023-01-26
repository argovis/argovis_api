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

    describe("GET /drifters", function () {
      it("searches for drifters records, dont request data", async function () {
        const response = await request.get("/drifters?polygon=[[-17,14],[-18,14],[-18,15],[-17,15],[-17,14]]").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/drifters'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /drifters", function () {
      it("searches for drifters profiles with data=except-data-values", async function () {
        const response = await request.get("/drifters?polygon=[[-17,14],[-18,14],[-18,15],[-17,15],[-17,14]]&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/drifters'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /drifters", function () {
      it("drifters with data filter should return drifters-consistent data", async function () {
        const response = await request.get("/drifters?polygon=[[-17,14],[-18,14],[-18,15],[-17,15],[-17,14]]&data=sst,ve").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/drifters'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /drifters", function () {
      it("drifters with data filter should return correct data_info row labels", async function () {
        const response = await request.get("/drifters?polygon=[[-17,14],[-18,14],[-18,15],[-17,15],[-17,14]]&data=sst,ve").set({'x-argokey': 'developer'});
        expect(response.body[0].data_info[0]).to.have.members(['sst','ve'])
      });
    });

    describe("GET /drifters", function () {
      it("drifters with data filter should return correct units", async function () {
        const response = await request.get("/drifters?polygon=[[-17,14],[-18,14],[-18,15],[-17,15],[-17,14]]&data=sst,ve").set({'x-argokey': 'developer'});
        iSST = response.body[0].data_info[0].indexOf('sst')
        iVE = response.body[0].data_info[0].indexOf('ve')
        iUnits = response.body[0].data_info[1].indexOf('units')
        expect(response.body[0].data_info[2][iSST][iUnits]).to.eql("Kelvin")
        expect(response.body[0].data_info[2][iVE][iUnits]).to.eql("m/s")
      })
    });

    describe("GET /drifters", function () {
      it("drifters with data=all filter should return drifters-consistent data", async function () {
        const response = await request.get("/drifters?polygon=[[-17,14],[-18,14],[-18,15],[-17,15],[-17,14]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/drifters'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /drifters", function () {
      it("drifters profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/drifters?id=101528_0&data=sst").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /drifters", function () {
      it("basic fetching drifter data", async function () {
        const response = await request.get("/drifters?startDate=2012-03-16T00:00:00Z&endDate=2012-03-17T00:00:00Z&data=sst").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/drifters'].get.responses['200'].content['application/json'].schema);
      });
    });    

    describe("GET /drifters/meta", function () {
      it("basic fetching drifter metadata", async function () {
        const response = await request.get("/drifters/meta?wmo=1300915").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/drifters/meta'].get.responses['200'].content['application/json'].schema);
      });
    });  

    describe("GET /drifters/vocabulary", function () {
      it("fetch possible drifter WMOs", async function () {
        const response = await request.get("/drifters/vocabulary?parameter=wmo").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members([1300915, 5500930])
      });
    });     

    describe("GET /drifters/vocabulary", function () {
      it("fetch possible drifter metadata keys", async function () {
        const response = await request.get("/drifters/vocabulary?parameter=metadata").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['101143', '101528'])
      });
    }); 

    describe("GET /drifters", function () {
      it("fetch drifter data with a polygon filter", async function () {
        const response = await request.get("/drifters?polygon=[[-18,14],[-17,14],[-17,15],[-18,15],[-18,14]]").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(10);
      });
    }); 

    describe("GET /drifters", function () {
      it("fetch drifter data with a multipolygon filter", async function () {
        const response = await request.get("/drifters?multipolygon=[[[-18,14],[-17,14],[-17,15],[-18,15],[-18,14]],[[-18,14],[-17,14],[-17,14.8],[-18,14.8],[-18,14]]]").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(6);
      });
    }); 

    describe("GET /drifters", function () {
      it("fetch drifter data via a cross reference with drifter metadata", async function () {
        const response = await request.get("/drifters?wmo=5500930").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(10);
      });
    }); 

    describe("GET /drifters", function () {
      it("fetch proximate drifter data, excluding document exactly at endDate", async function () {
        const response = await request.get("/drifters?center=-17.743450164794922,14.746769905090332&radius=100&startDate=2012-03-15T00:00:00Z&endDate=2012-03-16T00:00:00Z").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(2);
      });
    }); 

    describe("GET /drifters", function () {
      it("fetch drifter data by platform id", async function () {
        const response = await request.get("/drifters?platform=101143").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(10);
      });
    }); 

    describe("GET /drifters", function () {
      it("fetch drifter data by drifter id", async function () {
        const response = await request.get("/drifters?id=101143_0").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    }); 

    describe("GET /drifters", function () {
      it("should return appropriate minimal representation of this measurement", async function () {
        const response = await request.get("/drifters?id=101143_0&compression=minimal").set({'x-argokey': 'developer'});
        expect(response.body).to.eql([['101143_0', -17.74345, 14.74677, "2012-03-15T22:00:00.000Z",1300915]]);  
      });
    }); 

    describe("GET /drifters/meta", function () {
      it("fetch drifter metadata by platform number", async function () {
        const response = await request.get("/drifters/meta?platform=101143").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    }); 

    describe("GET /drifters/meta", function () {
      it("fetch drifter metadata by meta id", async function () {
        const response = await request.get("/drifters/meta?id=101528").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(1);
      });
    }); 

    describe("GET /drifters", function () {
      it("metadata group lookup", async function () {
        const response = await request.get("/drifters?metadata=101143").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(10);
      });
    });     

    describe("GET /drifters/meta", function () {
      it("should 404 on ID typos", async function () {
        const response = await request.get("/drifters/meta?id=xxx").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
        expect(response.body).to.eql([{"code": 404,"message": "No documents found matching search."}])
      });
    });

    describe("GET /drifters", function () {
      it("drifters with no data filter should not inclde data_keys on the data document", async function () {
        const response = await request.get("/drifters?id=101143_0").set({'x-argokey': 'developer'});
        expect(response.body[0].hasOwnProperty('data_keys')).to.eql(false);  
      });
    }); 

    describe("GET /drifters", function () {
      it("drifters with no data filter should not inclde units on the data document", async function () {
        const response = await request.get("/drifters?id=101143_0").set({'x-argokey': 'developer'});
        expect(response.body[0].hasOwnProperty('units')).to.eql(false);  
      });
    }); 
  }
})




