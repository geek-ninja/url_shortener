const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const app = require("./app");
const connectToDb = require("./databases/MongoDb.database");
const client = require("./config/Redis.config");

const port = process.env.PORT || 3000;

const server = http.createServer(app);
server.listen(port, async () => {
  connectToDb();
  await client.connect(); //connect to redis
  console.log(`Server is running on port : ${port}`);
});
