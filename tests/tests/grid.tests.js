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
    describe("GET /grids", function () {
      it("fetch grid window", async function () {
        const response = await request.get("/grids?gridName=ksTempTrend2&presLevel=10&latRange=-52,-50&lonRange=21,22&date=2012-09-01T00:00:00Z").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/grids'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /griddedProducts/gridMetadata", function () {
      it("fetch grid metadata", async function () {
        const response = await request.get("/griddedProducts/gridMetadata?gridName=ksTempTrend2").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/gridMetadata'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /griddedProducts/grid/window", function () {
      it("fetch grid window", async function () {
        const response = await request.get("/griddedProducts/grid/window?gridName=ksTempTrend2&presLevel=10&latRange=-52,-50&lonRange=21,22&date=2012-09-01T00:00:00Z").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/grid/window'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /griddedProducts/nonUniformGrid/window", function () {
      it("fetch nonuniform grid", async function () {
        const response = await request.get("/griddedProducts/nonUniformGrid/window?gridName=ksTempTrend2&presLevel=10&latRange=-52,-50&lonRange=21,22&date=2012-09-01T00:00:00Z").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/nonUniformGrid/window'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /griddedProducts/gridCoords", function () {
      it("fetch coordinates for gridded product", async function () {
        const response = await request.get("/griddedProducts/gridCoords?gridName=sose_si_area_1_day_sparse&latRange=-52,-50&lonRange=21,22").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/gridCoords'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /griddedProducts/gridParams/find", function () {
      it("fetch grid parameters", async function () {
        const response = await request.get("/griddedProducts/gridParams/find?gridName=ksSpaceTempTrend&presLevel=10&param=aOpt").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/gridParams/find'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /griddedProducts/grid/find", function () {
      it("fetch grid by name", async function () {
        const response = await request.get("/griddedProducts/grid/find?gridName=ksTempTrend2").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/grid/find'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /griddedProducts/gridParams/window", function () {
      it("tbd", async function () {
        const response = await request.get("/griddedProducts/gridParams/window?gridName=ksSpaceTempTrend&presLevel=10&latRange=-52,-50&lonRange=21,22&param=aOpt").set({'x-argokey': 'developer'});    
        expect(response.body).to.be.jsonSchema(schema.paths['/griddedProducts/gridParams/window'].get.responses['200'].content['application/json'].schema);
      });
    });
  }
})


