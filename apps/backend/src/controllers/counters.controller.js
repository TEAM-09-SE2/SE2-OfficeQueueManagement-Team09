const countersService = require("../services/counters.service");

function parseCounterId(req) {
  const counterId = Number(req.params.id);
  if (!Number.isInteger(counterId) || counterId <= 0) {
    throw new countersService.AppError(
      400,
      "INVALID_INPUT",
      "Invalid counter ID supplied.",
    );
  }
  return counterId;
}

async function getCounterServices(req, res, next) {
  res.locals.internalErrorMessage =
    "Internal server error occurred while retrieving counter services.";
  try {
    const services = await countersService.getCounterServices(
      parseCounterId(req),
    );
    res.json(services);
  } catch (err) {
    next(err);
  }
}

async function callNextCustomer(req, res, next) {
  res.locals.internalErrorMessage =
    "Internal server error occurred while calling the next ticket.";
  try {
    const ticket = await countersService.callNextCustomer(parseCounterId(req));
    if (!ticket) {
      res.status(204).end();
    } else {
      res.json(ticket);
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { getCounterServices, callNextCustomer };
