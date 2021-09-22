const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;

describe("GET /tc", function () {
  it("returns one tropical cyclone result", async function () {
    const response = await request.get("/tc");

    expect(response.status).to.eql(200);
  });
});

describe("GET /tc/findByDate", function () {
  it("returns one tropical cyclone result", async function () {
    const response = await request.get("/tc/findByDate?date=2018-08-26T12:00:00.000Z");
    expect(response.status).to.eql(200); 
  });
});

describe("GET /tc/findByDate", function () {
  it("fails to find anything in the db", async function () {
    const response = await request.get("/tc/findByDate?date=2017-08-26T12:00:00.000Z");
    expect(response.status).to.eql(404);    
  });
});

describe("GET /tc/findByDateRange", function () {
  it("returns one tropical cyclone result completely within the requested range", async function () {
    const response = await request.get("/tc/findByDateRange?startDate=2018-07-13T12:00:00Z&endDate=2018-09-13T12:00:00Z");
    expect(response.status).to.eql(200);    
  });
});

describe("GET /tc/findByDateRange", function () {
  it("returns one tropical cyclone result beginning within the requested range", async function () {
    const response = await request.get("/tc/findByDateRange?startDate=2018-08-15T12:00:00Z&endDate=2018-10-13T12:00:00Z");
    expect(response.status).to.eql(200);    
  });
});

describe("GET /tc/findByDateRange", function () {
  it("returns one tropical cyclone result ending within the requested range", async function () {
    const response = await request.get("/tc/findByDateRange?startDate=2018-06-13T12:00:00Z&endDate=2018-08-15T12:00:00Z");
    expect(response.status).to.eql(200);    
  });
});

describe("GET /tc/findByDateRange", function () {
  it("range does not include cyclone", async function () {
    const response = await request.get("/tc/findByDateRange?startDate=2018-06-13T12:00:00Z&endDate=2018-06-13T15:00:00Z");
    expect(response.status).to.eql(404);    
  });
});

describe("GET /tc/findByDateRange", function () {
  it("request rejected for being too long", async function () {
    const response = await request.get("/tc/findByDateRange?startDate=2018-06-13T12:00:00Z&endDate=2018-10-13T15:00:00Z");
    expect(response.status).to.eql(400);    
  });
});

describe("GET /tc/stormNameList", function () {
  it("format and return an appropriate storm name", async function () {
    const response = await request.get("/tc/stormNameList");
    expect(response.body[0]).to.eql('LANE-2018');   
  });
});

describe("GET /tc/findByNameYear", function () {
  it("return a tc by name and year", async function () {
    const response = await request.get("/tc/findByNameYear?name=lane&year=2018");
    expect(response.body[0].name).to.eql('LANE');   
  });
});