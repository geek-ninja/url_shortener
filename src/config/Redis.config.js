const { createClient } = require("redis");

const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_SOCKET_HOST,
    port: process.env.REDIS_SOCKET_PORT,
  },
});

client.on("connect", () => console.log("Redis Client connected successfully"));
client.on("error", (err) => console.log("Redis Client Error", err));

module.exports = client;
