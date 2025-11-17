import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function recalculateRatings() {
  console.log('Starting rating recalculation...\n');

  // Recalculate build ratings
  const builds = await prisma.build.findMany({
    include: {
      comments: {
        where: {
          rating: { not: null },
        },
        select: { rating: true },
      },
    },
  });

  console.log(`Found ${builds.length} builds to process`);

  for (const build of builds) {
    const ratings = build.comments.map(c => c.rating!).filter(r => r !== null);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null;

    await prisma.build.update({
      where: { id: build.id },
      data: {
        averageRating,
        ratingCount: ratings.length,
      },
    });

    console.log(`✓ Build "${build.name}": ${ratings.length} ratings, average: ${averageRating ? averageRating.toFixed(2) : 'N/A'}`);
  }

  // Recalculate guide ratings
  const guides = await prisma.guide.findMany({
    include: {
      comments: {
        where: {
          rating: { not: null },
        },
        select: { rating: true },
      },
    },
  });

  console.log(`\nFound ${guides.length} guides to process`);

  for (const guide of guides) {
    const ratings = guide.comments.map(c => c.rating!).filter(r => r !== null);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null;

    await prisma.guide.update({
      where: { id: guide.id },
      data: {
        averageRating,
        ratingCount: ratings.length,
      },
    });

    console.log(`✓ Guide "${guide.title}": ${ratings.length} ratings, average: ${averageRating ? averageRating.toFixed(2) : 'N/A'}`);
  }

  console.log('\n✅ Rating recalculation complete!');
  await prisma.$disconnect();
}

recalculateRatings()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('Error recalculating ratings:', e);
    process.exit(1);
  });
