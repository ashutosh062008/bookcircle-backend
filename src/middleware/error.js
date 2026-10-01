exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'CastError') { status = 400; message = `Invalid id: ${err.value}`; }
  if (err.code === 11000) { status = 409; message = 'Duplicate entry - already exists'; }
  if (err.name === 'ValidationError') { status = 400; }

  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};
