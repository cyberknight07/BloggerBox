import prisma from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const publicUserFields = {
  id: true,
  username: true,
  bio: true,
  avatar: true,
  role: true,
  createdAt: true,
};

export const getProfile = async (username) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      ...publicUserFields,
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const updateProfile = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: publicUserFields,
  });
};

export const listPostsByUser = async (username, { page = 1, limit = 10 } = {}) => {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw ApiError.notFound('User not found');

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: { select: { username: true, avatar: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.count({ where: { authorId: user.id, status: 'PUBLISHED' } }),
  ]);

  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
