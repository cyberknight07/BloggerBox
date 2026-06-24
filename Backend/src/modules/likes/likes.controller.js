import * as likesService from './likes.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const toggleLike = async (req, res) => {
  const result = await likesService.toggleLike(req.params.slug, req.user.userId);
  ApiResponse.ok(res, result);
};

export const getLikeStatus = async (req, res) => {
  const userId = req.user?.userId ?? null;
  const result = await likesService.getLikeStatus(req.params.slug, userId);
  ApiResponse.ok(res, result);
};
