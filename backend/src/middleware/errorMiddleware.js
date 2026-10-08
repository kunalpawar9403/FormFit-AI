export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message || err);

  const status = err.statusCode || err.status || 500;
  const message =
    status === 500
      ? 'An unexpected server error occurred. Please try again.'
      : err.message || 'Request failed.';

  res.status(status).json({
    success: false,
    message,
    code: err.code || 'INTERNAL_ERROR',
  });
}
