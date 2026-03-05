import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isAdmin = process.env.ADMIN_USER_ID === session.user.id;
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const reports = await prisma.report.findMany({
    where: { status: 'pending' },
    include: {
      reporter: { select: { name: true, email: true } },
      listing: { select: { id: true, title: true, status: true } },
      trade: { select: { id: true, haveText: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ reports });
}
