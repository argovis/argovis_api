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

    describe("validlonlat", function () {
      it("flags an invalid longitude", async function () {
        points = [[-185.2236986,70.1153552],[-183.9932299,56.4218209],[-155.5166674,56.7123646],[-154.1104174,69.8748184],[-185.2236986,70.1153552]]
        expect(helpers.validlonlat(points)).to.be.false  
      });
    }); 
  }
})