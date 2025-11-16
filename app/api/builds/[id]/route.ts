import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const build = await prisma.build.findUnique({
      where: { id },
      include: {
        tags: true,
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.build.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(build);
  } catch (error) {
    console.error('Error fetching build:', error);
    return NextResponse.json(
      { error: 'Failed to fetch build' },
      { status: 500 }
    );
  }
}
