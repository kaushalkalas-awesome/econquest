/**
 * Global Express error handler — returns JSON { error: message }.
 */
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  
  if (status >= 500) {
    // Only log unexpected server errors, not expected validation/auth throws
    console.error(`[Server Error ${status}]:`, err);
  } else if (process.env.NODE_ENV === 'development') {
    // Optional: console.warn(`[Client Error ${status}]: ${err.message}`);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const message =
    isProd && status === 500 ? 'Internal server error' : err.message || 'Something went wrong';
  
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
