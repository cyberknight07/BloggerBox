import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.user = payload;
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
};
