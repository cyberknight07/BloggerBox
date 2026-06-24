import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
  parentId: z.string().cuid('Invalid parent comment ID').optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});
