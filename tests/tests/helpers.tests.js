const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;
const chai = require('chai');
chai.use(require('chai-json-schema'));
chai.use(require('chai-almost')(0.00000001));
const rawspec = require('/tests/spec.json');
const $RefParser = require("@apidevtools/json-schema-ref-parser");
const helpers = require('/tests/tests/helpers')

const c = 1
const cellprice = 0.001
const metaDiscount = 100
const maxbulk = 100000
const bucketSize = 100

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
  
    describe("maxgeo", function () {
      it("block a request for a polygon covering an entire hemisphere", async function () {
        const max = helpers.maxgeo({type: "Polygon", coordinates: [[[0,90],[0,-90],[179.9,-90],[179.9,90],[0,90]]]}, null, null, null)
        expect(max.code).to.eql(400);
      });
    }); 

    describe("maxgeo", function () {
      it("block a request for a multipolygon covering an entire hemisphere", async function () {
        const max = helpers.maxgeo(null, [{type: "Polygon", coordinates: [[[0,1],[0,-1],[1,-1],[1,1],[0,1]]]},{type: "Polygon", coordinates: [[[0,90],[0,-90],[179.9,-90],[179.9,90],[0,90]]]}], null, null)
        expect(max.code).to.eql(400);
      });
    }); 

    describe("maxgeo", function () {
      it("block a request for a huge proximity search", async function () {
        const max = helpers.maxgeo(null, null, null, 10001)
        expect(max.code).to.eql(400);
      });
    });

    describe("cost functions", function () {
      it("cost of entire globe for a day with data for a standard API route", async function () {
        expect(helpers.cost('https://argovis-api.colorado.edu/argo?startDate=2000-01-01T00:00:00Z&endDate=2000-01-02T00:00:00Z&data=doxy', c, cellprice, metaDiscount, maxbulk)).to.almost.equal(360000000/13000*1*cellprice);
      });
    }); 

    describe("cost functions", function () {
      it("cost of entire globe for a day with data for a standard API route", async function () {
        expect(helpers.cost('https://argovis-api.colorado.edu/argo?startDate=2000-01-01T00:00:00Z&endDate=2000-01-02T00:00:00Z', c, cellprice, metaDiscount, maxbulk)).to.almost.equal(360000000/13000*1*cellprice/metaDiscount);
      });
    }); 

    describe("cost functions", function () {
      it("cost of 15 deg box near equator for 6 months with data for a standard API route should prohibit more than a few such requests in parallel", async function () {
        expect(helpers.cost('https://argovis-api.colorado.edu/argo?startDate=2000-01-01T00:00:00Z&endDate=2000-07-01T00:00:00Z&polygon=[[0,-7.5],[15,-7.5],[15,7.5],[0,7.5],[0,-7.5]]&data=temperature', c, cellprice, metaDiscount, maxbulk)*10).to.be.greaterThan(bucketSize);
      });
    }); 

    describe("cost functions", function () {
      it("cost of 15 deg box near equator for 10 years with data for a standard API route should be out of scope", async function () {
        expect(helpers.cost('https://argovis-api.colorado.edu/argo?startDate=2000-01-01T00:00:00Z&endDate=2010-01-01T00:00:00Z&polygon=[[0,-7.5],[15,-7.5],[15,7.5],[0,7.5],[0,-7.5]]&data=temperature', c, cellprice, metaDiscount, maxbulk).code).to.eql(413);
      });
    }); 
}

})