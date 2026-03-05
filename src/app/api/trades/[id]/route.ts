import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = await prisma.trade.findUnique({
    where: { id, status: 'active' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          locationLabel: true,
        },
      },
    },
  });
  if (!trade) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(trade);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const trade = await prisma.trade.findUnique({ where: { id } });
  if (!trade || trade.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }
  const body = await req.json();
  const updated = await prisma.trade.update({
    where: { id },
    data: {
      ...(body.haveText != null && { haveText: body.haveText }),
      ...(body.wantText != null && { wantText: body.wantText }),
      ...(body.note !== undefined && { note: body.note }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.locationLabel !== undefined && { locationLabel: body.locationLabel }),
      ...(body.maxDistanceKm !== undefined && { maxDistanceKm: body.maxDistanceKm }),
      ...(body.status != null && { status: body.status }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const trade = await prisma.trade.findUnique({ where: { id } });
  if (!trade || trade.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }
  await prisma.trade.update({ where: { id }, data: { status: 'removed' } });
  return NextResponse.json({ ok: true });
}
