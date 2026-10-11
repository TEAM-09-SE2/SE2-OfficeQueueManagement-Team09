function errorHandler(err, req, res, next) {
  if (err.status) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message },
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
