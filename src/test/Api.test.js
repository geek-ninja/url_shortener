const app = require("../app.js");
const axios = require("axios");
const http = require("http");
const connectToDb = require("../databases/MongoDb.database.js");
const client = require("../config/Redis.config.js");
const port = process.env.PORT || 3030;

let server;
beforeAll(() => {
  //connect to server
  server = http.createServer(app).listen(port, async () => {
    connectToDb(); //connect to mongoDB
    await client.connect(); //connect to redis
  });
});

afterAll(async () => {
  //close connection after all test case
  server.close();
});

describe("Test Case for : GET baseUrl/api/analytics/overall/url", () => {
  it("user login with proper creds", async () => {
    const res = await axios.get(
      "http://localhost:3030/api/analytics/overall/url",
      {
        headers: {
          Authorization: `Bearer ${yourToken}`,
        },
      }
    );
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("totalUrls");
    expect(res.data).toHaveProperty("totalClicks");
    expect(res.data).toHaveProperty("uniqueUsers");
    expect(res.data).toHaveProperty("clicksByDate");
    expect(res.data).toHaveProperty("osType");
    expect(res.data).toHaveProperty("deviceType");
  });
  it("user login with improper creds", async () => {
    const res = await axios.get(
      "http://localhost:3030/api/analytics/overall/url",
      {
        headers: {
          Authorization: `Bearer ${yourToken}`,
        },
      }
    );
    expect(res.status).toBe(500);
    expect(res.message).toBe(
      "Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token."
    );
  });
  it("user login with proper creds but not logged in or signup", async () => {
    const res = await axios.get(
      "http://localhost:3030/api/analytics/overall/url",
      {
        headers: {
          Authorization: `Bearer ${yourToken}`,
        },
      }
    );
    expect(res.status).toBe(404);
    expect(res.message).toBe("User Not Found");
  });
});
