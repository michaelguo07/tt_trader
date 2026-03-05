import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const notif = await prisma.matchNotification.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.matchNotification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
