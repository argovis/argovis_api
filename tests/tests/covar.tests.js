const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;

describe("GET /covarGrid/-58/98/140", function () {
  it("returns one covar grid result", async function () {
    const response = await request.get("/covarGrid/-58/98/140");

    expect(response.status).to.eql(200);
  });
});

describe("GET /covarGrid/98/-58/140", function () {
  it("errors on invalid lat", async function () {
    const response = await request.get("/covarGrid/98/-58/140");

    expect(response.status).to.eql(400);
  });
});

describe("GET /covarGrid/0/0/240", function () {
  it("returns a 404", async function () {
    const response = await request.get("/covarGrid/0/0/240");

    expect(response.status).to.eql(404);
  });
});