const ticketsService = require("../services/tickets.service");
const AppError = require("../errors/AppError");

function parseServiceId(req) {
  const serviceId = req.body?.id_service;
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    throw new AppError(
      400,
      "INVALID_INPUT",
      "Invalid input: id_service must be a valid integer.",
    );
  }
  return serviceId;
}

async function createTicket(req, res, next) {
  res.locals.internalErrorMessage =
    "Internal server error occurred while creating the ticket.";
  try {
    const ticket = await ticketsService.createTicket(parseServiceId(req));
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

module.exports = { createTicket };
