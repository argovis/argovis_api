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

    describe("GET /grids/rg09_temperature", function () {
      it("searches for grids, dont request data", async function () {
        const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/rg09_temperature", function () {
      it("searches for grids profiles with data=except-data-values", async function () {
        const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=except-data-values").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /grids/rg09_temperature", function () {
      it("grids with data filter should return grids-consistent data", async function () {
        const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_temperature").set({'x-argokey': 'developer'});
        console.log(response.body)
        expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
      });
    });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("grids with data filter should return correct data_keys", async function () {
    //     const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_temperature").set({'x-argokey': 'developer'});
    //     expect(response.body[0].data_keys).to.have.members(['rg09_temperature'])
    //   });
    // });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("grids with data filter should return correct units", async function () {
    //     const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_temperature").set({'x-argokey': 'developer'});
    //     expect(response.body[0].units).to.deep.equal({'rg09_temperature':"J/m^2"})
    //   });
    // });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("grids with data filter should return correct units, as a list when compressed", async function () {
    //     const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=rg09_temperature&compression=array").set({'x-argokey': 'developer'});
    //     expect(response.body[0].units).to.deep.equal(["J/m^2"])
    //   });
    // });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("grids with data=all filter should return grids-consistent data", async function () {
    //     const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=all").set({'x-argokey': 'developer'});
    //     expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
    //   });
    // });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("grids with data=all filter should return correct data_keys", async function () {
    //     const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=all").set({'x-argokey': 'developer'});
    //     expect(response.body[0].data_keys).to.have.members(['rg09_temperature'])
    //   });
    // });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("grids with data=all filter should return correct units", async function () {
    //     const response = await request.get("/grids/rg09_temperature?polygon=[[20,-64],[21,-64],[21,-65],[20,-65],[20,-64]]&data=all").set({'x-argokey': 'developer'});
    //     expect(response.body[0].units).to.deep.equal({"rg09_temperature":"J/m^2"})
    //   });
    // });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("grids profile should be dropped if no requested data is available", async function () {
    //     const response = await request.get("/grids/rg09_temperature?id=20050115000000_120.5_-64.5&data=rg09_temperature").set({'x-argokey': 'developer'});
    //     expect(response.status).to.eql(404);
    //   });
    // });

    // describe("GET /grids/temperature_rg", function () {
    //   it("grids with data=all and presRange filters should return correct data", async function () {
    //     const response = await request.get("/grids/temperature_rg?id=20040115000000_29.5_-64.5&data=all&presRange=5,100").set({'x-argokey': 'developer'});
    //     expect(response.body[0].data[0].temperature_rg).to.eql(-0.017)
    //   });
    // });

    // describe("GET /grids/temperature_rg", function () {
    //   it("grids with data=all and presRange filters should report levels, post filtering, on the data document", async function () {
    //     const response = await request.get("/grids/temperature_rg?id=20040115000000_29.5_-64.5&data=all&presRange=5,100").set({'x-argokey': 'developer'});
    //     expect(response.body[0].levels).to.deep.equal([ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    //   });
    // });

    // describe("GET /grids/meta", function () {
    //   it("grid metadata", async function () {
    //     const response = await request.get("/grids/meta?id=rg09_temperature").set({'x-argokey': 'developer'});
    //     expect(response.body).to.be.jsonSchema(schema.paths['/grids/meta'].get.responses['200'].content['application/json'].schema);
    //   });
    // }); 


    // describe("GET /grids/rg09_temperature", function () {
    //   it("fetch gridded data", async function () {
    //     const response = await request.get("/grids/rg09_temperature?polygon=[[112,-65],[112,-64],[114,-64],[114,-65],[112,-65]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z&data=rg09_temperature").set({'x-argokey': 'developer'});
    //     expect(response.body).to.be.jsonSchema(schema.paths['/grids/{gridName}'].get.responses['200'].content['application/json'].schema);
    //   });
    // });

    // describe("GET /grids/temperature_rg", function () {
    //   it("fetch gridded data with pressure bracket", async function () {
    //     const response = await request.get("/grids/temperature_rg?id=20190115000000_20.5_-64.5&presRange=10,100&data=temperature_rg&compression=array").set({'x-argokey': 'developer'});
    //     expect(response.body[0]['data']).to.eql( [[ 0.37 ], [ 0.11 ], [ -0.318 ], [ -0.959 ], [ -1.37 ], [ -1.508 ], [ -1.468 ], [ -1.206 ], [ -0.745 ], [ -0.275 ]]);
    //   });
    // });

    // describe("GET /grids/temperature_rg", function () {
    //   it("check reported level range with pressure bracket", async function () {
    //     const response = await request.get("/grids/temperature_rg?id=20190115000000_20.5_-64.5&presRange=10,100&data=temperature_rg").set({'x-argokey': 'developer'});
    //     expect(response.body[0]['levels']).to.eql([10,20,30,40,50,60,70,80,90,100]);
    //   });
    // });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("fetch gridded data in overlap region between two polygons", async function () {
    //     const response = await request.get("/grids/rg09_temperature?multipolygon=[[[112,-65],[112,-64],[116,-64],[116,-65],[112,-65]],[[114,-65],[114,-64],[120,-64],[120,-65],[114,-65]]]&startDate=2000-01-01T00:00:00Z&endDate=2020-01-01T00:00:00Z").set({'x-argokey': 'developer'});
    //     expect(response.body.length).to.eql(2);
    //   });
    // });

    // describe("GET /grids/rg09_temperature", function () {
    //   it("should return appropriate minimal representation of this measurement", async function () {
    //     const response = await request.get("/grids/rg09_temperature?id=20050115000000_107.5_-64.5&compression=minimal").set({'x-argokey': 'developer'});
    //     expect(response.body).to.eql([['20050115000000_107.5_-64.5', 107.5, -64.5, "2005-01-15T00:00:00.000Z"]]);  
    //   });
    // }); 
  }
})

