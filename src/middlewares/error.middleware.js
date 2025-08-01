const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export { errorMiddleware };