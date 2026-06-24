export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change_me_access',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me_refresh',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim()),
  },
};
