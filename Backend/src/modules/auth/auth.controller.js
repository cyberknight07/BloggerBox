import * as authService from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const register = async (req, res) => {
  const result = await authService.register(req.body);
  ApiResponse.created(res, result, 'Registration successful');
};

export const login = async (req, res) => {
  const result = await authService.login(req.body);
  ApiResponse.ok(res, result, 'Login successful');
};

export const refresh = async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  ApiResponse.ok(res, result, 'Token refreshed');
};

export const logout = async (req, res) => {
  await authService.logout(req.body.refreshToken);
  ApiResponse.noContent(res);
};

export const me = async (req, res) => {
  ApiResponse.ok(res, { user: req.user });
};
