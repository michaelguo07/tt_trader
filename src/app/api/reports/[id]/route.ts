import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isAdmin = process.env.ADMIN_USER_ID === session.user.id;
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const { status, removeListing, removeTrade } = body;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (status === 'reviewed' || status === 'dismissed') {
    await prisma.report.update({ where: { id }, data: { status } });
  }
  if (removeListing && report.listingId) {
    await prisma.listing.update({ where: { id: report.listingId }, data: { status: 'removed' } });
  }
  if (removeTrade && report.tradeId) {
    await prisma.trade.update({ where: { id: report.tradeId }, data: { status: 'removed' } });
  }
  return NextResponse.json({ ok: true });
}
