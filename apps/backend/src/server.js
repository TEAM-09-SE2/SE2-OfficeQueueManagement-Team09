require("dotenv").config();

const app = require("./app");
const { enableDailyQueueReset } = require("./middlewares/dailyQueueReset");

const PORT = process.env.PORT || 4000;

// Turns on the daily reset of the queues (at midnight, Italian time), and
// resets them right away if the server was off at midnight.
enableDailyQueueReset();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
