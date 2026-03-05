import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: listingId } = await params;
  const listing = await prisma.listing.findUnique({ where: { id: listingId, status: 'active' } });
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.favourite.upsert({
    where: {
      userId_listingId: { userId: session.user.id, listingId },
    },
    create: { userId: session.user.id, listingId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: listingId } = await params;
  await prisma.favourite.deleteMany({
    where: { userId: session.user.id, listingId },
  });
  return NextResponse.json({ ok: true });
}
