import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { createCommentSchema, updateCommentSchema } from './comments.schema.js';
import * as commentsController from './comments.controller.js';

const router = Router({ mergeParams: true });

// Mounted at /api/posts/:slug/comments
router.get('/:slug/comments', commentsController.listComments);
router.post('/:slug/comments', authenticate, validate(createCommentSchema), commentsController.createComment);

// Mounted at /api/comments
router.put('/:id', authenticate, validate(updateCommentSchema), commentsController.updateComment);
router.delete('/:id', authenticate, commentsController.deleteComment);

export default router;
