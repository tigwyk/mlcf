import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // Check if guide exists and user is the author
    const existingGuide = await prisma.guide.findUnique({
      where: { id },
    });

    if (!existingGuide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    if (existingGuide.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only edit your own guides' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, summary, tags } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Update tags if provided
    let tagConnections = [];
    if (tags) {
      tagConnections = await Promise.all(
        tags.map(async (tagName: string) => {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {},
          });
          return { id: tag.id };
        })
      );
    }

    // Update the guide
    const updatedGuide = await prisma.guide.update({
      where: { id },
      data: {
        title,
        content,
        summary,
        tags: tags ? {
          set: [], // Clear existing tags
          connect: tagConnections,
        } : undefined,
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

    return NextResponse.json(updatedGuide);
  } catch (error) {
    console.error('Error updating guide:', error);
    return NextResponse.json(
      { error: 'Failed to update guide' },
      { status: 500 }
    );
  }
}
