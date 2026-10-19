const AppError = require("../errors/AppError");

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }
  // Thrown by express.json() when the request body is not valid JSON, or is
  // JSON but not an object or an array.
  if (err.type === "entity.parse.failed") {
    res.status(400).json({
      error: {
        code: "INVALID_INPUT",
        message: "Request body must be a valid JSON object.",
      },
    });
    return;
  }
  // Other errors in the request itself, e.g. a body that is too large (413) or
  // uses an unsupported charset (415): keep the status, use the documented code.
  if (err.status >= 400 && err.status < 500) {
    res.status(err.status).json({
      error: { code: "INVALID_INPUT", message: err.message },
    });
    return;
  }
  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: res.locals.internalErrorMessage ?? "Internal server error.",
    },
  });
}

module.exports = errorHandler;
