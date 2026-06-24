import prisma from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const commentWithAuthor = {
  author: { select: { id: true, username: true, avatar: true } },
  replies: {
    include: {
      author: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
};

export const listComments = async (postSlug, { page = 1, limit = 20 } = {}) => {
  const post = await prisma.post.findUnique({ where: { slug: postSlug }, select: { id: true } });
  if (!post) throw ApiError.notFound('Post not found');

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { postId: post.id, parentId: null },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: commentWithAuthor,
    }),
    prisma.comment.count({ where: { postId: post.id, parentId: null } }),
  ]);

  return {
    comments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const createComment = async (postSlug, authorId, { content, parentId }) => {
  const post = await prisma.post.findUnique({ where: { slug: postSlug }, select: { id: true } });
  if (!post) throw ApiError.notFound('Post not found');

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.postId !== post.id) throw ApiError.badRequest('Invalid parent comment');
  }

  return prisma.comment.create({
    data: { content, authorId, postId: post.id, parentId },
    include: { author: { select: { id: true, username: true, avatar: true } } },
  });
};

export const updateComment = async (commentId, userId, role, { content }) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw ApiError.notFound('Comment not found');
  if (comment.authorId !== userId && role !== 'ADMIN') throw ApiError.forbidden();

  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: { author: { select: { id: true, username: true, avatar: true } } },
  });
};

export const deleteComment = async (commentId, userId, role) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw ApiError.notFound('Comment not found');
  if (comment.authorId !== userId && role !== 'ADMIN') throw ApiError.forbidden();
  await prisma.comment.delete({ where: { id: commentId } });
};
