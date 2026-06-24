import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { createPostSchema, updatePostSchema, listPostsQuerySchema } from './posts.schema.js';
import * as postsController from './posts.controller.js';

const router = Router();

router.get('/', validateQuery(listPostsQuerySchema), postsController.listPosts);
router.get('/:slug', postsController.getPost);
router.post('/', authenticate, validate(createPostSchema), postsController.createPost);
router.put('/:slug', authenticate, validate(updatePostSchema), postsController.updatePost);
router.delete('/:slug', authenticate, postsController.deletePost);

export default router;
