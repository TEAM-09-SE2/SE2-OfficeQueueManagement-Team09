const cors = require("cors");
const express = require("express");
const countersRoutes = require("./routes/counters.routes");
const servicesRoutes = require("./routes/services.routes");
const ticketsRoutes = require("./routes/tickets.routes");
const { dailyQueueReset } = require("./middlewares/dailyQueueReset");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(dailyQueueReset);
app.use("/api/counters", countersRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use(errorHandler);

module.exports = app;
