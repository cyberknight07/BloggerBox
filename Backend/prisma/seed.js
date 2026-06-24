import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@blog.dev' },
    update: {},
    create: {
      email: 'admin@blog.dev',
      username: 'admin',
      password: passwordHash,
      bio: 'Administrator account',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'jane@blog.dev' },
    update: {},
    create: {
      email: 'jane@blog.dev',
      username: 'jane',
      password: passwordHash,
      bio: 'Full-stack developer and writer.',
    },
  });

  const tags = await Promise.all(
    ['JavaScript', 'Node.js', 'PostgreSQL', 'Express', 'Web Dev'].map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name, { lower: true, strict: true }) },
        update: {},
        create: {
          name,
          slug: slugify(name, { lower: true, strict: true }),
        },
      })
    )
  );

  const post = await prisma.post.upsert({
    where: { slug: 'getting-started-with-node-js' },
    update: {},
    create: {
      title: 'Getting Started with Node.js',
      slug: 'getting-started-with-node-js',
      content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine...',
      excerpt: 'A beginner-friendly introduction to Node.js.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user.id,
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[1].id },
        ],
      },
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Great post! Very helpful for beginners.',
      authorId: admin.id,
      postId: post.id,
    },
  });

  console.log('Seed complete.');
  console.log('  admin@blog.dev / password123');
  console.log('  jane@blog.dev  / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
