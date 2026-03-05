import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const search = await prisma.savedSearch.findFirst({ where: { id, userId: session.user.id } });
  if (!search) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.savedSearch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
