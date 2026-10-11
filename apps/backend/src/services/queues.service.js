const queuesRepository = require("../database/queues.repository");
const { officeDayStart } = require("../utils/officeTime");

/* Daily reset of the queues ("every morning the queues are reset") for the
 office day `today` (YYYY-MM-DD):
 1. tickets issued before today that are still open are closed: a ticket
 being served counts as served, a ticket still waiting expires;
 2. the ticket counters of the services restart, so today's numbering starts
 again from 000.
 */
async function resetQueues(today) {
  const { served, expired } = await queuesRepository.closeTicketsIssuedBefore(
    officeDayStart(today),
  );
  const counters = await queuesRepository.resetServiceCounters(today);
  return { served, expired, counters };
}

module.exports = { resetQueues };
