import prisma from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

export const listTags = async () => {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  });
};

export const getTag = async (slug) => {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: { _count: { select: { posts: true } } },
  });

  if (!tag) throw ApiError.notFound('Tag not found');
  return tag;
};
