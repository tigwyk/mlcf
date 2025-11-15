import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author, summary, tags } = body;

    // Validate required fields
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      );
    }

    // Create or connect tags
    const tagConnections = tags
      ? await Promise.all(
          tags.map(async (tagName: string) => {
            const tag = await prisma.tag.upsert({
              where: { name: tagName },
              create: { name: tagName },
              update: {},
            });
            return { id: tag.id };
          })
        )
      : [];

    // Create the guide
    const guide = await prisma.guide.create({
      data: {
        title,
        content,
        author,
        summary,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(guide, { status: 201 });
  } catch (error) {
    console.error('Error creating guide:', error);
    return NextResponse.json(
      { error: 'Failed to create guide' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const tag = searchParams.get('tag');

    const guides = await prisma.guide.findMany({
      where: tag
        ? {
            tags: {
              some: {
                name: tag,
              },
            },
          }
        : undefined,
      include: {
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
      take: 50,
    });

    return NextResponse.json(guides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guides' },
      { status: 500 }
    );
  }
}
