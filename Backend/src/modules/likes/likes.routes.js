import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as likesController from './likes.controller.js';

const router = Router();

// GET  /api/posts/:slug/likes  — public, but returns liked=true/false if user is authed
router.get('/:slug/likes', likesController.getLikeStatus);

// POST /api/posts/:slug/likes  — toggles like (requires auth)
router.post('/:slug/likes', authenticate, likesController.toggleLike);

export default router;
