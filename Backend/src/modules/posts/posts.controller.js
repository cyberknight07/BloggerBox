import * as postsService from './posts.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const listPosts = async (req, res) => {
  const result = await postsService.listPosts(req.query);
  ApiResponse.ok(res, result);
};

export const getPost = async (req, res) => {
  const post = await postsService.getPost(req.params.slug);
  ApiResponse.ok(res, { post });
};

export const createPost = async (req, res) => {
  const post = await postsService.createPost(req.user.userId, req.body);
  ApiResponse.created(res, { post });
};

export const updatePost = async (req, res) => {
  const post = await postsService.updatePost(
    req.params.slug,
    req.user.userId,
    req.user.role,
    req.body
  );
  ApiResponse.ok(res, { post }, 'Post updated');
};

export const deletePost = async (req, res) => {
  await postsService.deletePost(req.params.slug, req.user.userId, req.user.role);
  ApiResponse.noContent(res);
};
