import type { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  console.error(error);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export default errorHandler;