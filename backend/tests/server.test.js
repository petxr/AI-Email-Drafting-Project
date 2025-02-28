const request = require("supertest");
const app = require("../server");

describe("Server Health Check", () => {
  it("should respond with 200 on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("✅ Server is running!");
  });
});