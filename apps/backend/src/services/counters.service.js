const countersRepository = require("../database/counters.repository");
const AppError = require("../errors/AppError");

async function ensureCounterExists(counterId) {
  const counter = await countersRepository.findCounterById(counterId);
  if (!counter) {
    throw new AppError(404, "COUNTER_NOT_FOUND", "Counter not found.");
  }
}

async function getCounterServices(counterId) {
  await ensureCounterExists(counterId);
  return countersRepository.findServicesByCounter(counterId);
}

async function callNextCustomer(counterId) {
  await ensureCounterExists(counterId);
  const servedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z"); // to remove milliseconds and remain coherent with the format of the data in populate.sql
  const ticket = await countersRepository.callNextTicket(counterId, servedAt);
  return ticket ?? null;
}

async function getServingTickets() {
  return countersRepository.getServingTickets();
}

module.exports = {
  ensureCounterExists,
  getCounterServices,
  callNextCustomer,
  getServingTickets,
  AppError,
};
