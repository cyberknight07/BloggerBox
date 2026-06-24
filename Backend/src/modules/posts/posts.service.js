import slugify from 'slugify';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const postWithRelations = {
  author: { select: { id: true, username: true, avatar: true } },
  tags: { include: { tag: { select: { name: true, slug: true } } } },
  _count: { select: { likes: true, comments: true } },
};

const generateSlug = async (title) => {
  const base = slugify(title, { lower: true, strict: true });
  const exists = await prisma.post.findUnique({ where: { slug: base } });
  if (!exists) return base;
  return `${base}-${Date.now()}`;
};

export const listPosts = async ({ page, limit, tag, author, status = 'PUBLISHED' }) => {
  const skip = (page - 1) * limit;

  const where = {
    status,
    ...(tag && { tags: { some: { tag: { slug: tag } } } }),
    ...(author && { author: { username: author } }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: postWithRelations,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getPost = async (slug) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: postWithRelations,
  });

  if (!post) throw ApiError.notFound('Post not found');
  return post;
};

export const createPost = async (authorId, { title, content, excerpt, status, tags }) => {
  const slug = await generateSlug(title);
  const publishedAt = status === 'PUBLISHED' ? new Date() : null;

  const tagConnections = await resolveOrCreateTags(tags);

  return prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      status,
      publishedAt,
      authorId,
      tags: { create: tagConnections.map((tagId) => ({ tagId })) },
    },
    include: postWithRelations,
  });
};

export const updatePost = async (slug, userId, role, data) => {
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) throw ApiError.notFound('Post not found');
  if (post.authorId !== userId && role !== 'ADMIN') throw ApiError.forbidden();

  const updates = { ...data };

  if (data.title) {
    updates.slug = await generateSlug(data.title);
  }

  if (data.status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
    updates.publishedAt = new Date();
  }

  if (data.tags !== undefined) {
    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    const tagConnections = await resolveOrCreateTags(data.tags);
    await prisma.postTag.createMany({
      data: tagConnections.map((tagId) => ({ postId: post.id, tagId })),
    });
    delete updates.tags;
  }

  return prisma.post.update({
    where: { id: post.id },
    data: updates,
    include: postWithRelations,
  });
};

export const deletePost = async (slug, userId, role) => {
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) throw ApiError.notFound('Post not found');
  if (post.authorId !== userId && role !== 'ADMIN') throw ApiError.forbidden();
  await prisma.post.delete({ where: { id: post.id } });
};

async function resolveOrCreateTags(tagNames = []) {
  const ids = [];
  for (const name of tagNames) {
    const slug = slugify(name, { lower: true, strict: true });
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
      select: { id: true },
    });
    ids.push(tag.id);
  }
  return ids;
}
