import { ApiError } from '../utils/ApiError.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: `A record with this ${err.meta?.target?.join(', ')} already exists.`,
      errors: [],
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: 'Record not found.',
      errors: [],
    });
  }

  console.error('[Unhandled Error]', err);

  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'Internal server error',
    errors: [],
  });
};
