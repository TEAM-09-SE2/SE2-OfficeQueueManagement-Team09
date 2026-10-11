const servicesService = require("../services/services.service");

async function getServices(req, res, next) {
  res.locals.internalErrorMessage =
    "Internal server error occurred while retrieving services.";
  try {
    const services = await servicesService.getServices();
    res.json(services);
  } catch (err) {
    next(err);
  }
}

module.exports = { getServices };
