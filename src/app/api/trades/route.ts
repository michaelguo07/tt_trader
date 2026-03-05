import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') ?? undefined;
  const q = searchParams.get('q') ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(24, Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: 'active' };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { haveText: { contains: q } },
      { wantText: { contains: q } },
      { note: { contains: q } },
    ];
  }

  const [trades, total] = await Promise.all([
    prisma.trade.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, locationLabel: true } },
      },
    }),
    prisma.trade.count({ where }),
  ]);

  return NextResponse.json({ trades, total, page, limit });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { haveText, wantText, note, category, locationLabel, latitude, longitude, maxDistanceKm } = body;
  if (!haveText?.trim() || !wantText?.trim()) {
    return NextResponse.json({ error: 'Have and want text required' }, { status: 400 });
  }
  const trade = await prisma.trade.create({
    data: {
      userId: session.user.id,
      haveText: haveText.trim(),
      wantText: wantText.trim(),
      note: note?.trim() || null,
      category: category || null,
      locationLabel: locationLabel || null,
      latitude: latitude != null ? parseFloat(latitude) : null,
      longitude: longitude != null ? parseFloat(longitude) : null,
      maxDistanceKm: maxDistanceKm != null && maxDistanceKm !== '' ? parseFloat(maxDistanceKm) : null,
    },
  });
  return NextResponse.json(trade);
}
