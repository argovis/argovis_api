const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;
const chai = require('chai');
chai.use(require('chai-json-schema'));
const rawspec = require('/tests/core-spec.json');
const $RefParser = require("@apidevtools/json-schema-ref-parser");

const dereferenceSchema = async (rawspec) => {
  return new Promise((resolve, reject) => {
    $RefParser.dereference(rawspec, (err, schema) => {
      if (err) {
        reject(err);
      } else {
        resolve(schema);
      }
    });
  });
};

let schema;

before(async function() {
  schema = await dereferenceSchema(rawspec);
});

describe("GET /easyocean?woceline&section_start_date", function () {
  it("returns the data documents associated with a particular occupancy of a particular woceline", async function () {
    const response = await request.get("/easyocean?woceline=SR04&section_start_date=2010-12-24T00:00:00Z").set({'x-argokey': 'developer'});
    expect(response.body.length).to.eql(5)
    expect(response.body).to.be.jsonSchema(schema.paths['/easyocean'].get.responses['200'].content['application/json'].schema);
  });
});

describe("GET /easyocean", function () {
  it("check basic box behavior", async function () {
    const response = await request.get("/easyocean?box=[[-56,-67],[-55,-66]]").set({'x-argokey': 'developer'});
    expect(response.body.length).to.eql(2); 
  });
}); 

describe("GET /easyocean", function () {
  it("check woceline filtering", async function () {
    const response = await request.get("/easyocean?box=[[-56,-67],[-55,-66]]&woceline=A10").set({'x-argokey': 'developer'});
    expect(response.body.length).to.eql(0); 
  });
}); 

describe("GET /easyocean", function () {
  it("check basic vertical filter behavior", async function () {
    const response = await request.get("/easyocean?id=woce_sr04_date_20101225_lat_-66-98_lon_-13-0&data=pressure,doxy&verticalRange=0,100").set({'x-argokey': 'developer'});
    expect(response.body[0].data[response.body[0].data_info[0].indexOf('doxy')]).to.deep.eql([341.057,340.213,334.985,329.6,325.02,319.416,313.503,308.965,304.173]); 
  });
}); 

describe("GET /easyocean", function () {
  it("check basic data filter behavior", async function () {
    const response = await request.get("/easyocean?id=woce_sr04_date_20101225_lat_-66-98_lon_-13-0&data=pressure,doxy").set({'x-argokey': 'developer'});
    expect(response.body[0].data_info[0]).to.deep.eql(['pressure', 'doxy']); 
  });
}); 

describe("GET /easyocean", function () {
  it("check basic stubbing behavior", async function () {
    const response = await request.get("/easyocean?id=woce_sr04_date_20101225_lat_-66-98_lon_-13-0&compression=minimal").set({'x-argokey': 'developer'});
    expect(response.body[0]).to.deep.eql(["woce_sr04_date_20101225_lat_-66-98_lon_-13-0",-13,-66.98,"2010-12-25T00:00:00.000Z",["SR04"]]); 
  });
}); 

describe("GET /easyocean", function () {
  it("check basic batchmeta behavior", async function () {
    const response = await request.get("/easyocean?startDate=2010-12-23T00:00:00Z&endDate=2010-12-26T00:00:00Z&batchmeta=true").set({'x-argokey': 'developer'});
    expect(response.body.length).to.eql(1); 
    expect(response.body[0]._id).to.eql("SR04"); 
  });
}); 

describe("GET /easyocean", function () {
    it("check basic data filtration behavior", async function () {
      const response = await request.get("/easyocean?startDate=2010-12-23T00:00:00Z&endDate=2010-12-26T00:00:00Z&data=doxy").set({'x-argokey': 'developer'});
      expect(response.body[0].data_info[0]).to.include("pressure"); 
    });
  }); 