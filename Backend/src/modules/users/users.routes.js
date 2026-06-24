import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema } from './users.schema.js';
import * as usersController from './users.controller.js';

const router = Router();

router.get('/:username', usersController.getProfile);
router.get('/:username/posts', usersController.listPostsByUser);
router.put('/me', authenticate, validate(updateProfileSchema), usersController.updateProfile);

export default router;
