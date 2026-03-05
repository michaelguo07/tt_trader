import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const sendSchema = z.object({
  receiverId: z.string(),
  threadId: z.string(),
  body: z.string().min(1).max(2000),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get('threadId');
  if (threadId) {
    const messages = await prisma.message.findMany({
      where: {
        threadId,
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    await prisma.message.updateMany({
      where: { threadId, receiverId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ messages });
  }
  const sent = await prisma.message.findMany({
    where: { senderId: session.user.id },
    select: { threadId: true },
    distinct: ['threadId'],
  });
  const received = await prisma.message.findMany({
    where: { receiverId: session.user.id },
    select: { threadId: true },
    distinct: ['threadId'],
  });
  const threadIds = Array.from(new Set([...sent.map((m) => m.threadId), ...received.map((m) => m.threadId)]));
  const threads: { threadId: string; other: { id: string; name: string | null }; lastMessage: string; lastAt: Date }[] = [];
  for (const tid of threadIds) {
    const last = await prisma.message.findFirst({
      where: { threadId: tid },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
    if (!last) continue;
    const other = last.senderId === session.user.id ? last.receiver : last.sender;
    threads.push({
      threadId: tid,
      other: { id: other.id, name: other.name },
      lastMessage: last.body.slice(0, 80),
      lastAt: last.createdAt,
    });
  }
  threads.sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
  return NextResponse.json({ threads });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = sendSchema.parse(body);
    if (data.receiverId === session.user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: data.receiverId,
        threadId: data.threadId,
        body: data.body,
      },
    });
    return NextResponse.json(message);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
