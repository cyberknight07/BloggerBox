import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    throw ApiError.badRequest('Validation failed', errors);
  }

  req.body = result.data;
  next();
};

export const validateQuery = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    throw ApiError.badRequest('Invalid query parameters', errors);
  }

  req.query = result.data;
  next();
};
