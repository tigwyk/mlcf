import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guide = await prisma.guide.findUnique({
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

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.guide.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide' },
      { status: 500 }
    );
  }
}
