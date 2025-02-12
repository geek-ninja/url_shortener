const mongoose = require("mongoose");

const connectToDb = () => {
  mongoose.connect(process.env.DATABASE_ACCESS);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "db connection error:"));
  db.once("open", () => {
    console.log("Connected to db");
  });
};

module.exports = connectToDb;
