import { z } from 'zod';

export const updateProfileSchema = z.object({
  bio: z.string().max(300, 'Bio must be at most 300 characters').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});
