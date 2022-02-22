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
        const response = await request.get("/profiles?startDate=2006-04-01T00:00:00.000Z&endDate=2006-05-01T00:00:00.000Z").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("searches for profiles by date and geo", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743935]]").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("gets only pressure measurements", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743935]]&coreMeasurements=pres").set({'x-argokey': 'developer'});
        expect(Object.keys(response.body[0].measurements[0])).to.have.members(['pres']);
      });
    });

    describe("GET /profiles", function () {
      it("fails on too long a date range", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-04-01T00:00:00.000Z").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(400);
      });
    });

    describe("GET /profiles", function () {
      it("gets profiles for one platform", async function () {
        const response = await request.get("/profiles?platforms=4902911").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles'].get.responses['200'].content['application/json'].schema);
      });
    });

    describe("GET /profiles", function () {
      it("fails on too many platforms", async function () {
        const response = await request.get("/profiles?platforms=4902911,9999").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(400);
      });
    });

    describe("GET /profiles", function () {
      it("fails with an unclosed polygon", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743936]]").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(400);
      });
    });

    describe("GET /profiles", function () {
      it("cuts off pressures greater than 100", async function () {
        const response = await request.get("/profiles?startDate=2020-01-01T00:00:00.000Z&endDate=2020-03-30T00:00:00.000Z&polygon=[[-54.228515625,41.50857729743935],[-57.919921875,36.1733569352216],[-51.328125,36.10237644873644],[-54.228515625,41.50857729743935]]&coreMeasurements=all&presRange=0,100").set({'x-argokey': 'developer'});
        expect(response.body[0].measurements[response.body[0].measurements.length-1].pres).to.be.lessThan(100)
      });
    });

    describe("GET /profiles", function () {
      it("should find 3 profiles within a 100 km of this point", async function () {
        const response = await request.get("/profiles?startDate=2017-04-24T00:00:00Z&endDate=2017-07-06T00:00:00Z&center=-74.79661,34.92019&radius=100").set({'x-argokey': 'developer'});
        expect(response.body.length).to.eql(3)
      });
    });

    describe("GET /profiles", function () {
      it("should only return CCHDO profiles", async function () {
        const response = await request.get("/profiles?ids=4902911_107,337566314.951_213&dac=CCHDO").set({'x-argokey': 'developer'});
        dacs = response.body.map(p => p.dac)
        s = new Set(dacs)
        expect(Array.from(s)).to.eql(['CCHDO'])
      });
    });

    describe("GET /profiles", function () {
      it("fails to find any dissolved oxygen in BGC measurements", async function () {
        const response = await request.get("/profiles?startDate=2019-07-04T03:03:00Z&endDate=2019-09-04T03:03:00Z&bgcMeasurements=doxy").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });   

    describe("GET /profiles", function () {
      it("finds a core temperature measurement on the given day", async function () {
        const response = await request.get("/profiles?startDate=2019-12-03T00:00:00Z&endDate=2019-12-04T00:00:00Z&coreMeasurements=temp").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(200);
      });
    });

    describe("GET /profiles", function () {
      it("fails to find a core salinity measurement on the given day", async function () {
        const response = await request.get("/profiles?startDate=2019-12-03T00:00:00Z&endDate=2019-12-04T00:00:00Z&coreMeasurements=psal").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /profiles", function () {
      it("drops profile that doesn't have any of the requested measurements", async function () {
        const response = await request.get("/profiles?ids=6902908_119D&coreMeasurements=psal&bgcMeasurements=doxy_btl").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });    

    describe("GET /profiles/overview", function () {
      it("summarizes profile collection", async function () {
        const response = await request.get("/profiles/overview").set({'x-argokey': 'developer'});
        expect(response.body).to.be.jsonSchema(schema.paths['/profiles/overview'].get.responses['200'].content['application/json'].schema);   
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("lists the IDs of any profile with BGC data", async function () {
        const response = await request.get("/profiles/listID?startDate=2019-07-04T03:03:00Z&endDate=2019-09-04T03:03:00Z&bgcMeasurements=all").set({'x-argokey': 'developer'});
        expect(response.body[0]).to.eql('337566314.951_213')  
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("lists the IDs of any profile with a core salinity measurement", async function () {
        const response = await request.get("/profiles/listID?startDate=2017-04-23T03:40:19Z&endDate=2017-07-06T18:50:38.002Z&coreMeasurements=psal").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members([ '4902911_0', '4902911_10', '4902911_11' ])
      });
    }); 

    describe("GET /profiles/listID", function () {
      it("lists the IDs of any profile with BGC data or a core salinity measurement", async function () {
        const response = await request.get("/profiles/listID?startDate=2019-07-04T03:03:00Z&endDate=2019-09-04T03:03:00Z&coreMeasurements=psal&bgcMeasurements=all").set({'x-argokey': 'developer'});
        expect(response.body).to.have.members(['337566314.951_213'])
      });
    });

    describe("GET /profiles/listID", function () {
      it("fails to find any dissolved oxygen in BGC measurements", async function () {
        const response = await request.get("/profiles/listID?startDate=2019-07-04T03:03:00Z&endDate=2019-09-04T03:03:00Z&bgcMeasurements=doxy").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });   

    describe("GET /profiles/listID", function () {
      it("fails to find any dissolved oxygen in BGC measurements", async function () {
        const response = await request.get("/profiles/listID?startDate=2019-07-04T03:03:00Z&endDate=2019-09-04T03:03:00Z&bgcMeasurements=doxy").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });      

    describe("GET /profiles/listID", function () {
      it("fails to find a profile with core salinity measurement on the given day", async function () {
        const response = await request.get("/profiles/listID?startDate=2019-12-03T00:00:00Z&endDate=2019-12-04T00:00:00Z&coreMeasurements=psal").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });

    describe("GET /profiles/listID", function () {
      it("doesn't list profile that doesn't have any of the requested measurements", async function () {
        const response = await request.get("/profiles/listID?startDate=2020-03-11T21:40:58Z&endDate=2020-03-11T21:41:01Z&coreMeasurements=psal&bgcMeasurements=doxy_btl").set({'x-argokey': 'developer'});
        expect(response.status).to.eql(404);
      });
    });    
  }
})