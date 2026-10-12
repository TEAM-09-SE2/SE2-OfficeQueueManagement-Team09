const cors = require("cors");
const express = require("express");
const countersRoutes = require("./routes/counters.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/counters", countersRoutes);
app.use(errorHandler);

module.exports = app;