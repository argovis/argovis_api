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
    describe("GET /profiles", function () {
      it("searches for profiles by date", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z");
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("searches for profiles by date and geo", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743935]]");
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("gets only pressure measurements", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743935]]&coreMeasurements=pres");
        expect(Object.keys(response.body[0].measurements[0])).to.have.members(['pres']);
      });
    });

    describe("GET /profiles", function () {
      it("fails on too long a date range", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-04-01T00:00:00.000Z");
        expect(response.status).to.eql(400);
      });
    });

    describe("GET /profiles", function () {
      it("gets profiles for one platform", async function () {
        const response = await request.get("/profiles?platforms=4902911");
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("fails on too many platforms", async function () {
        const response = await request.get("/profiles?platforms=4902911,9999");
        expect(response.status).to.eql(400);
      });
    });

    describe("GET /profiles", function () {
      it("fails with an unclosed polygon", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743936]]");
        expect(response.status).to.eql(400);
      });
    });

    describe("GET /profiles", function () {
      it("cuts off pressures greater than 100", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743935]]&coreMeasurements=all&presRange=0,100");
        expect(response.body[0].measurements[response.body[0].measurements.length-1].pres).to.be.lessThan(100)
      });
    });

    describe("GET /profiles/overview", function () {
      it("summarizes profile collection", async function () {
        const response = await request.get("/profiles/overview");
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles/overview'].get.responses['200'].content['application/json'].schema);   
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("lists the IDs of any profile with BGC data", async function () {
        const response = await request.get("/profiles/listID?startDate=2019-07-04T03:03:00Z&endDate=2019-09-04T03:03:00Z&bgcMeasurements=all");
        expect(response.body[0]).to.eql('337566314.951_213')  
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("lists the IDs of any profile with a core salinity measurement", async function () {
        const response = await request.get("/profiles/listID?startDate=2017-04-23T03:40:19Z&endDate=2017-07-06T18:50:38.002Z&coreMeasurements=psal");
        expect(response.body).to.have.members([ '4902911_0', '4902911_10', '4902911_11' ])
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("lists the IDs of any profile with BGC data or a core salinity measurement", async function () {
        const response = await request.get("/profiles/listID?startDate=2019-07-04T03:03:00Z&endDate=2019-09-04T03:03:00Z&coreMeasurements=psal&bgcMeasurements=all");
        expect(response.body).to.have.members(['337566314.951_213'])
      });
    });

    describe("GET /profiles/listID", function () {
      it("fails to find any dissolved oxygen in BGC measurements", async function () {
        const response = await request.get("/profiles/listID?startDate=2019-07-04T03:03:00Z&endDate=2019-09-04T03:03:00Z&bgcMeasurements=doxy");
        expect(response.status).to.eql(404);
      });
    });        
  }
})