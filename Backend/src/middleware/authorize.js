import { ApiError } from '../utils/ApiError.js';

export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
};
