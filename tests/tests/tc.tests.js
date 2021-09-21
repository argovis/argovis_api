const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;

describe("GET /tc", function () {
  it("returns one tropical cyclone result", async function () {
    const response = await request.get("/tc");

    expect(response.status).to.eql(200);
  });
});
