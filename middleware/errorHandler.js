const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // In production, you would have different logic (less info leaked)
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack, // Remove this line in production!
  });
};

module.exports = { globalErrorHandler };
