import prisma from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

export const toggleLike = async (postSlug, userId) => {
  const post = await prisma.post.findUnique({ where: { slug: postSlug }, select: { id: true } });
  if (!post) throw ApiError.notFound('Post not found');

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId: post.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { postId: post.id } });
    return { liked: false, likes: count };
  }

  await prisma.like.create({ data: { userId, postId: post.id } });
  const count = await prisma.like.count({ where: { postId: post.id } });
  return { liked: true, likes: count };
};

export const getLikeStatus = async (postSlug, userId) => {
  const post = await prisma.post.findUnique({ where: { slug: postSlug }, select: { id: true } });
  if (!post) throw ApiError.notFound('Post not found');

  const [liked, count] = await Promise.all([
    userId
      ? prisma.like.findUnique({ where: { userId_postId: { userId, postId: post.id } } })
      : null,
    prisma.like.count({ where: { postId: post.id } }),
  ]);

  return { liked: !!liked, likes: count };
};
