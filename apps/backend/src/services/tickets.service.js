const servicesRepository = require("../database/services.repository");
const ticketsRepository = require("../database/tickets.repository");
const AppError = require("../errors/AppError");
const { officeDate, toIsoSeconds } = require("../utils/officeTime");

const NUMBERS_PER_DAY = 1000; // 000 to 999

// Service code followed by the number on 3 digits, e.g. "A007".
function formatTicketCode(serviceCode, number) {
  return `${serviceCode}${String(number).padStart(3, "0")}`;
}

/* Ticket numbers of a service:
 1. start from 000 every day;
 2. go up to 999, then start again from 000;
 3. skip a number whose code is still in use (a ticket with that code is
 waiting or being served).

 Returns null when every number is in use.
 */
function chooseTicketNumber(service, today, codesInUse) {
  // Last number issued today, or -1 if none yet: current_number is NULL after
  // the daily reset, and a counter of a previous day means the reset could
  // not run.
  let number =
    service.last_ticket_date === today && service.current_number !== null
      ? service.current_number
      : -1;
  for (let attempt = 0; attempt < NUMBERS_PER_DAY; attempt++) {
    number = (number + 1) % NUMBERS_PER_DAY;
    if (!codesInUse.has(formatTicketCode(service.code, number))) {
      return number;
    }
  }
  return null;
}

async function issueTicket(serviceId) {
  const service = await servicesRepository.findServiceById(serviceId);
  if (!service) {
    throw new AppError(404, "SERVICE_NOT_FOUND", "Service not found.");
  }
  if (service.counters_count === 0) {
    throw new AppError(
      409,
      "SERVICE_NOT_AVAILABLE",
      "This service is not handled by any counter.",
    );
  }

  const now = new Date();
  const today = officeDate(now);
  const codesInUse = new Set(
    await ticketsRepository.findActiveTicketCodes(serviceId),
  );
  const number = chooseTicketNumber(service, today, codesInUse);
  if (number === null) {
    throw new AppError(
      409,
      "QUEUE_FULL",
      "The queue for this service is full. Please try again later.",
    );
  }

  return ticketsRepository.createTicket(
    serviceId,
    formatTicketCode(service.code, number),
    number,
    toIsoSeconds(now),
    today,
  );
}

// Tickets are issued one at a time: two kiosks asking at the same moment
// would otherwise read the same last number and get the same code.
let lastIssue = Promise.resolve();

function createTicket(serviceId) {
  const issue = lastIssue.then(() => issueTicket(serviceId));
  lastIssue = issue.catch(() => {});
  return issue;
}

module.exports = {
  createTicket,
  chooseTicketNumber,
  formatTicketCode,
};
