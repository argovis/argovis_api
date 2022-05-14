const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;
const chai = require('chai');
chai.use(require('chai-json-schema'));
chai.use(require('chai-almost')(0.00000001));
const rawspec = require('/tests/spec.json');
const $RefParser = require("@apidevtools/json-schema-ref-parser");
const helpers = require('/tests/tests/helpers')

$RefParser.dereference(rawspec, (err, schema) => {
  if (err) {
    console.error(err);
  }
  else {

    describe("steradians", function () {
      it("sanity check steradian caclulation", async function () {
        const sum = helpers.geoWeightedSum([{value: 1, lons: [0,180], lats: [0,90]}, {value: 2, lons: [0,90], lats: [0,90]}])
        expect(helpers.steradians([0,360], [-90,90])).to.eql(4*Math.PI)  
      });
    }); 

    describe("steradians", function () {
      it("compares the area of two zones", async function () {
        expect(helpers.steradians([0,360], [89,90])).to.be.lessThan(helpers.steradians([0,360], [0,1]))  
      });
    }); 

    describe("geoWeightedSum", function () {
      it("checks a simple weighted sum over geo regions", async function () {
        const sum = helpers.geoWeightedSum([{value: 1, lons: [0,180], lats: [0,90]}, {value: 2, lons: [0,90], lats: [0,90]}])
        expect(sum).to.almost.equal(2*Math.PI)  
      });
    }); 

    describe("arrayinflate", function () {
      it("inflates a minified measurement back into a regular measurement", async function () {
        keys = ['pres', 'psal', 'temp']
        meas = [36.4, 34.914, 7.987]
        expect(helpers.arrayinflate(keys,meas)).to.deep.equal({"pres": 36.4, "psal": 34.914, "temp": 7.987})  
      });
    }); 

    describe("validlonlat", function () {
      it("flags an invalid longitude", async function () {
        points = [[-185.2236986,70.1153552],[-183.9932299,56.4218209],[-155.5166674,56.7123646],[-154.1104174,69.8748184],[-185.2236986,70.1153552]]
        expect(helpers.validlonlat(points)).to.be.false  
      });
    }); 

    describe("has_data", function () {
      it("rejects a profile for not having one of the requested variables", async function () {
        keys = ['temp', 'nitrate']
        profile = {'data_keys': ['temp', 'pres'], 'data': [[20,0], [19,10], [10,20]]}
        expect(helpers.has_data(profile,keys,false)).to.be.false  
      });
    }); 

    describe("has_data", function () {
      it("rejects a profile for having nothing but nan in the requested variable", async function () {
        keys = ['temp', 'nitrate']
        profile = {'data_keys': ['nitrate', 'temp'], 'data': [[Number.NaN,0], [Number.NaN,10], [Number.NaN,20]]}
        expect(helpers.has_data(profile,keys,true)).to.be.false  
      });
    }); 

    describe("has_data", function () {
      it("rejects a profile with some but not all the desired data", async function () {
        keys = ['temp', 'nitrate']
        profile = {'data_keys': ['nitrate', 'pres'], 'data': [[1,0], [2,10], [3,20]]}
        expect(helpers.has_data(profile,keys,false)).to.be.false 
      });
    }); 

    describe("has_data", function () {
      it("accepts a profile with all the desired data", async function () {
        keys = ['pres', 'nitrate']
        profile = {'data_keys': ['nitrate', 'pres'], 'data': [[1,0], [2,10], [3,20]]}
        expect(helpers.has_data(profile,keys,false)).to.be.true 
      });
    }); 

    describe("has_data", function () {
      it("handles an empty data array", async function () {
        keys = ['pres', 'nitrate']
        profile = {'data_keys': ['nitrate', 'pres'], 'data': []}
        expect(helpers.has_data(profile,keys,true)).to.be.false 
      });
    });

    describe("request_scoping", function () {
      it("allows the whole globe for a day", async function () {
        startDate = new Date('2020-01-01T00:00:00Z')
        endDate = new Date('2020-01-02T00:00:00Z')
        polygon = null
        box = null
        center = null
        radius = null
        multipolygon = null
        id = null
        platform = null
        expect(helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform)).to.be.false 
      });
    });

    describe("request_scoping", function () {
      it("allows a 15 degree box near the equator for 6 months", async function () {
        startDate = new Date('2020-01-01T00:00:00Z')
        endDate = new Date('2020-07-01T00:00:00Z')
        polygon = null
        box = [[0,-7.5],[15,7.5]]
        center = null
        radius = null
        multipolygon = null
        id = null
        platform = null
        expect(helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform)).to.be.false 
      });
    }); 

    describe("request_scoping", function () {
      it("disallows a 20 degree box near the equator for 6 months", async function () {
        startDate = new Date('2020-01-01T00:00:00Z')
        endDate = new Date('2020-07-01T00:00:00Z')
        polygon = null
        box = [[0,-10],[20,10]]
        center = null
        radius = null
        multipolygon = null
        id = null
        platform = null
        expect(helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform)).to.have.property('code', 413) 
      });
    });

    describe("request_scoping", function () {
      it("allows a 15 degree box as a polygon near the equator for 6 months", async function () {
        startDate = new Date('2020-01-01T00:00:00Z')
        endDate = new Date('2020-07-01T00:00:00Z')
        polygon = {"type": "Polygon","coordinates": [[[0,-7.5],[15,-7.5],[15,7.5],[0,7.5],[0,-7.5]]]}
        box = null
        center = null
        radius = null
        multipolygon = null
        id = null
        platform = null
        expect(helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform)).to.be.false 
      });
    });

    describe("request_scoping", function () {
      it("allows a 20 degree box near the equator for 6 months if an ID is also present", async function () {
        startDate = new Date('2020-01-01T00:00:00Z')
        endDate = new Date('2020-07-01T00:00:00Z')
        polygon = null
        box = [[0,-10],[20,10]]
        center = null
        radius = null
        multipolygon = null
        id = 'test-id'
        platform = null
        expect(helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform)).to.be.false 
      });
    }); 

    describe("request_scoping", function () {
      it("allows a 20 degree box near the equator for 6 months if an ID is also present", async function () {
        startDate = new Date('2020-01-01T00:00:00Z')
        endDate = new Date('2020-07-01T00:00:00Z')
        polygon = null
        box = [[0,-10],[20,10]]
        center = null
        radius = null
        multipolygon = null
        id = null
        platform = 'test-platform'
        expect(helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform)).to.be.false 
      });
    });   
  }

  describe("request_scoping", function () {
    it("allows a 2 degree box near the equator for all time", async function () {
      startDate = null
      endDate = null
      polygon = null
      box = [[0,-0.5],[1,0.5]]
      center = null
      radius = null
      multipolygon = null
      id = null
      platform = null
      expect(helpers.request_scoping(startDate, endDate, polygon, box, center, radius, multipolygon, id, platform)).to.be.false 
    });
  }); 
})