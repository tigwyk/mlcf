import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateSkillExport } from '@/lib/skillParser';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, exportString, tags } = body;

    // Validate required fields
    if (!name || !exportString) {
      return NextResponse.json(
        { error: 'Name and export string are required' },
        { status: 400 }
      );
    }

    // Validate export string
    if (!validateSkillExport(exportString)) {
      return NextResponse.json(
        { error: 'Invalid skill export string' },
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

    // Create the build
    const build = await prisma.build.create({
      data: {
        name,
        description,
        exportString,
        authorId: session.user.id,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        tags: true,
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(build, { status: 201 });
  } catch (error) {
    console.error('Error creating build:', error);
    return NextResponse.json(
      { error: 'Failed to create build' },
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

    const builds = await prisma.build.findMany({
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
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
      take: 50,
    });

    return NextResponse.json(builds);
  } catch (error) {
    console.error('Error fetching builds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch builds' },
      { status: 500 }
    );
  }
}
