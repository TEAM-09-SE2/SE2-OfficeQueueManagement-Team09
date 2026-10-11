const queuesService = require("../services/queues.service");
const {
  officeDate,
  officeDayStart,
  nextOfficeDay,
} = require("../utils/officeTime");

/* Resets the queues automatically every day at midnight (Italian time):
 1. when the server starts, in case it was off at midnight;
 2. with a timer that fires exactly at the next midnight in Italy;
 3. before handling a request, if the reset of the new day has not happened
 yet (e.g. the computer was asleep at midnight), so no request ever sees the
 queues of a previous day.

 Running the reset again on the same day (e.g. after a restart) changes
 nothing. If it fails, requests keep working and it is retried a minute later.

 It only runs after server.js calls enableDailyQueueReset(): the tests use
 app.js directly and keep full control of the data.
 */
const RETRY_DELAY_MS = 60 * 1000;

let enabled = false;
let lastResetDay = null;
let runningReset = null;
let retryTimer = null;

// Never rejects: a failed reset is logged and retried later.
function resetIfNewDay() {
  const today = officeDate(new Date());
  if (today === lastResetDay) {
    return Promise.resolve();
  }
  // Requests arriving while the reset runs wait for the same reset.
  if (!runningReset) {
    runningReset = queuesService
      .resetQueues(today)
      .then(({ served, expired, counters }) => {
        lastResetDay = today;
        logReset(today, served, expired, counters);
      })
      .catch((err) => {
        logResetFailure(today, err);
        scheduleRetry();
      })
      .finally(() => {
        runningReset = null;
      });
  }
  return runningReset;
}

function scheduleRetry() {
  if (retryTimer) {
    return;
  }
  retryTimer = setTimeout(() => {
    retryTimer = null;
    resetIfNewDay();
  }, RETRY_DELAY_MS);
  retryTimer.unref();
}

// Fires at the next midnight in Italy (23, 24 or 25 hours away, depending on
// summer time), then plans the following one.
function scheduleMidnightReset() {
  const now = new Date();
  const nextMidnight = Date.parse(officeDayStart(nextOfficeDay(officeDate(now))));
  // unref(): the timer alone does not keep the process running.
  setTimeout(() => {
    resetIfNewDay().then(scheduleMidnightReset);
  }, nextMidnight - now.getTime()).unref();
}

function logReset(day, served, expired, counters) {
  if (served + expired + counters === 0) {
    console.log(`Queues already reset for ${day}.`);
    return;
  }
  console.log(
    `Queues reset for ${day}: ${served} ticket(s) marked served, ${expired} expired, ` +
      `${counters} service counter(s) restarted.`,
  );
}

function logResetFailure(day, err) {
  console.error(
    `Daily queue reset for ${day} failed, retrying in 1 minute: ${err.message}`,
  );
  if (/CHECK constraint failed/.test(err.message)) {
    console.error(
      "Your database was created with an older schema.sql: recreate it (README, Create DB).",
    );
  }
}

function enableDailyQueueReset() {
  if (!enabled) {
    enabled = true;
    scheduleMidnightReset();
  }
  return resetIfNewDay();
}

function dailyQueueReset(req, res, next) {
  // While a failed reset waits for its retry, requests are not slowed down.
  if (!enabled || retryTimer) {
    next();
    return;
  }
  resetIfNewDay().then(() => next());
}

module.exports = { dailyQueueReset, enableDailyQueueReset };
