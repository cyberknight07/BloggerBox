import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';
import { config } from '../../config/index.js';
import { ApiError } from '../../utils/ApiError.js';

const SALT_ROUNDS = 10;

const signAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

const signRefreshToken = (userId) =>
  jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

const refreshTokenExpiry = () => {
  const [amount, unit] = [
    parseInt(config.jwt.refreshExpiresIn),
    config.jwt.refreshExpiresIn.slice(-1),
  ];
  const ms = unit === 'd' ? amount * 86400000 : unit === 'h' ? amount * 3600000 : amount * 60000;
  return new Date(Date.now() + ms);
};

export const register = async ({ email, username, password }) => {
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (exists?.email === email) throw ApiError.conflict('Email already in use');
  if (exists?.username === username) throw ApiError.conflict('Username already taken');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, username, password: hashed },
    select: { id: true, email: true, username: true, role: true, createdAt: true },
  });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
  });

  return { user, accessToken, refreshToken };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
  });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

export const refresh = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token not found or expired');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw ApiError.unauthorized('User not found');

  const accessToken = signAccessToken(user.id, user.role);
  return { accessToken };
};

export const logout = async (token) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};
