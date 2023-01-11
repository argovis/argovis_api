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

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("searches for grids, dont request data", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("searches for grids profiles with data=rg09_salinity,except-data-values", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_salinity,except-data-values").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data filter should return grids-consistent data", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_temperature").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data filter should return correct data_keys", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_temperature").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members(['rg09_temperature'])
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data filter should return correct units", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_temperature").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({'rg09_temperature':"degree celcius (ITS-90)"})
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data filter should return correct units, as a list when compressed", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_salinity&compression=array").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal(["psu"])
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data=all filter should return grids-consistent data", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data=all filter should return correct data_keys", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members(['rg09_temperature', 'rg09_salinity'])
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data=all filter should return correct units", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({"rg09_temperature":"degree celcius (ITS-90)", "rg09_salinity": 'psu'})
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?id=20040115000000_20.5_-64.5&data=kg21_ohc15to300").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data=all and presRange filters should return correct data", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?id=20040115000000_20.5_-64.5&data=all&presRange=5,100").set({'x-argokey': 'developer'});
        expect(response.body[0].data.rg09_temperature[0]).to.eql(-0.076)
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("grids with data=all and presRange filters should report levels, post filtering, on the data document", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?id=20040115000000_29.5_-64.5&data=all&presRange=5,100").set({'x-argokey': 'developer'});
        expect(response.body[0].levels).to.deep.equal([[ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]])
      });
    });

    describe("GET /grids/meta", function () {
      it("grid metadata", async function () {
        const response = await request.get("/grids/meta?id=rg09_temperature").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/meta'].get.responses['200'].content['application/json'].schema);
      });
    }); 

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("fetch gridded data with pressure bracket", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?id=20040115000000_20.5_-64.5&presRange=10,100&data=rg09_temperature&compression=array").set({'x-argokey': 'developer'});
        expect(response.body[0]['data']).to.eql([[-0.076, -0.21, -0.593, -1.201, -1.598, -1.663, -1.569, -1.15, -0.603, -0.134]]);
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("check reported level range with pressure bracket", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?id=20040115000000_20.5_-64.5&presRange=10,100&data=rg09_temperature&compression=array").set({'x-argokey': 'developer'});
        expect(response.body[0]['levels']).to.eql([[10,20,30,40,50,60,70,80,90,100]]);
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("fetch gridded data in overlap region between two polygons", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?multipolygon=[[[22,-65],[22,-64],[26,-64],[26,-65],[22,-65]],[[24,-65],[24,-64],[30,-64],[30,-65],[24,-65]]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(2);
      });
    });

    describe("GET /grids/grid_1_1_0.5_0.5", function () {
      it("should return appropriate minimal representation of this measurement", async function () {
        const response = await request.get("/grids/grid_1_1_0.5_0.5?id=20040115000000_20.5_-64.5&compression=minimal").set({'x-argokey': 'developer'});
        expect(response.body).to.eql([['20040115000000_20.5_-64.5', 20.5, -64.5, "2004-01-15T00:00:00.000Z"]]);  
      });
    }); 
  }
})

