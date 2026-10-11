// Error with an HTTP status and an error code, turned into a JSON error
// response by the errorHandler middleware.
class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = AppError;
