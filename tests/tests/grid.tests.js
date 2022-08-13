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

    describe("GET /grids/ohc_kg", function () {
      it("searches for grids, dont request data", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("searches for grids profiles with data=metadata-only", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]&data=metadata-only").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("grids with data filter should return grids-consistent data", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]&data=ohc_kg").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("grids with data filter should return correct data_keys", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]&data=ohc_kg").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members(['ohc_kg'])
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("grids with data filter should return correct units", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]&data=ohc_kg").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({'ohc_kg':"J/m^2"})
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("grids with data filter should return correct units, as a list when compressed", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]&data=ohc_kg&compression=basic").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal(["J/m^2"])
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("grids with data=all filter should return grids-consistent data", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("grids with data=all filter should return correct data_keys", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].data_keys).to.have.members(['ohc_kg'])
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("grids with data=all filter should return correct units", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[107,-64],[108,-64],[108,-65],[107,-65],[107,-64]]&data=all").set({'x-argokey': 'developer'});
        expect(response.body[0].units).to.deep.equal({"ohc_kg":"J/m^2"})
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("grids profile should be dropped if no requested data is available", async function () {
        const response = await request.get("/grids/ohc_kg?id=20050115000000_120.5_-64.5&data=ohc_kg").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /grids/temperature_rg", function () {
      it("grids with data=all and presRange filters should return correct data", async function () {
        const response = await request.get("/grids/temperature_rg?id=20040115000000_29.5_-64.5&data=all&presRange=5,100").set({'x-argokey': 'developer'});
        expect(response.body[0].data[0].temperature_rg).to.eql(-0.017)
      });
    });

    describe("GET /grids/temperature_rg", function () {
      it("grids with data=all and presRange filters should report levels, post filtering, on the data document", async function () {
        const response = await request.get("/grids/temperature_rg?id=20040115000000_29.5_-64.5&data=all&presRange=5,100").set({'x-argokey': 'developer'});
        expect(response.body[0].levels).to.deep.equal([ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      });
    });

    describe("GET /grids/meta", function () {
      it("grid metadata", async function () {
        const response = await request.get("/grids/meta?id=ohc_kg").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/meta'].get.responses['200'].content['application/json'].schema);
      });
    }); 


    describe("GET /grids/ohc_kg", function () {
      it("fetch gridded data", async function () {
        const response = await request.get("/grids/ohc_kg?polygon=[[112,-65],[112,-64],[114,-64],[114,-65],[112,-65]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z&data=ohc_kg").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/temperature_rg", function () {
      it("fetch gridded data with pressure bracket", async function () {
        const response = await request.get("/grids/temperature_rg?id=20190115000000_20.5_-64.5&presRange=10,100&data=temperature_rg&compression=basic-minification").set({'x-argokey': 'developer'});
        expect(response.body[0]['data']).to.eql( [[ 0.37 ], [ 0.11 ], [ -0.318 ], [ -0.959 ], [ -1.37 ], [ -1.508 ], [ -1.468 ], [ -1.206 ], [ -0.745 ], [ -0.275 ]]);
      });
    });

    describe("GET /grids/temperature_rg", function () {
      it("check reported level range with pressure bracket", async function () {
        const response = await request.get("/grids/temperature_rg?id=20190115000000_20.5_-64.5&presRange=10,100&data=temperature_rg").set({'x-argokey': 'developer'});
        expect(response.body[0]['levels']).to.eql([10,20,30,40,50,60,70,80,90,100]);
      });
    });

    describe("GET /grids/ohc_kg", function () {
      it("fetch gridded data in overlap region between two polygons", async function () {
        const response = await request.get("/grids/ohc_kg?multipolygon=[[[112,-65],[112,-64],[116,-64],[116,-65],[112,-65]],[[114,-65],[114,-64],[120,-64],[120,-65],[114,-65]]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(2);
      });
    });
  }
})

