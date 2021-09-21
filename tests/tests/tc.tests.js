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

    const response = await request.get("/tc/findByDate?date=2017-08-26T12:00:00.000Z");
    expect(response.status).to.eql(404);    
  });
});