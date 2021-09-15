const request = require("supertest")("http://api:8080");
const expect = require("chai").expect;

describe("GET /arShapes", function () {
  it("returns one atmo river result", async function () {
    const response = await request.get("/arShapes");

    expect(response.status).to.eql(200);
  });
});
