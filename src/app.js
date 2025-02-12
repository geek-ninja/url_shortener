const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/User.routes");
const urlRoutes = require("./routes/Url.routes");
const analyticsRoutes = require("./routes/Analytics.routes");
const swaggerDocument = require("./docs/swagger.json");
const swaggerUi = require("swagger-ui-express");

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/user", userRoutes);
app.use("/api/shorten", urlRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
