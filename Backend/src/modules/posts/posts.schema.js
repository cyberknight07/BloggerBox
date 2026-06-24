import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(300).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  tags: z.array(z.string()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  tag: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});
