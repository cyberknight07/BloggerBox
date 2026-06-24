import * as commentsService from './comments.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const listComments = async (req, res) => {
  const { page = '1', limit = '20' } = req.query;
  const result = await commentsService.listComments(req.params.slug, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  ApiResponse.ok(res, result);
};

export const createComment = async (req, res) => {
  const comment = await commentsService.createComment(req.params.slug, req.user.userId, req.body);
  ApiResponse.created(res, { comment });
};

export const updateComment = async (req, res) => {
  const comment = await commentsService.updateComment(
    req.params.id,
    req.user.userId,
    req.user.role,
    req.body
  );
  ApiResponse.ok(res, { comment }, 'Comment updated');
};

export const deleteComment = async (req, res) => {
  await commentsService.deleteComment(req.params.id, req.user.userId, req.user.role);
  ApiResponse.noContent(res);
};
