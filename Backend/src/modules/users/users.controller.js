import * as usersService from './users.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const getProfile = async (req, res) => {
  const user = await usersService.getProfile(req.params.username);
  ApiResponse.ok(res, { user });
};

export const updateProfile = async (req, res) => {
  const user = await usersService.updateProfile(req.user.userId, req.body);
  ApiResponse.ok(res, { user }, 'Profile updated');
};

export const listPostsByUser = async (req, res) => {
  const { page = '1', limit = '10' } = req.query;
  const result = await usersService.listPostsByUser(req.params.username, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  ApiResponse.ok(res, result);
};
