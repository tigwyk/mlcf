import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { validateSkillExport } from '@/lib/skillParser';

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

    // Check if build exists and user is the author
    const existingBuild = await prisma.build.findUnique({
      where: { id },
    });

    if (!existingBuild) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    if (existingBuild.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only edit your own builds' },
        { status: 403 }
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

    // Update the build
    const updatedBuild = await prisma.build.update({
      where: { id },
      data: {
        name,
        description,
        exportString,
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

    return NextResponse.json(updatedBuild);
  } catch (error) {
    console.error('Error updating build:', error);
    return NextResponse.json(
      { error: 'Failed to update build' },
      { status: 500 }
    );
  }
}
