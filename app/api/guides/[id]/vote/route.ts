import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { vote } = await request.json();

    if (vote !== 'up' && vote !== 'down') {
      return NextResponse.json(
        { error: 'Vote must be "up" or "down"' },
        { status: 400 }
      );
    }

    const guide = await prisma.guide.findUnique({
      where: { id },
      select: { upvotes: true, downvotes: true },
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Simple vote increment (in a production app, you'd track individual votes to prevent duplicates)
    const updatedGuide = await prisma.guide.update({
      where: { id },
      data: {
        upvotes: vote === 'up' ? guide.upvotes + 1 : guide.upvotes,
        downvotes: vote === 'down' ? guide.downvotes + 1 : guide.downvotes,
      },
      select: { upvotes: true, downvotes: true },
    });

    return NextResponse.json(updatedGuide);
  } catch (error) {
    console.error('Error voting on guide:', error);
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  }
}
