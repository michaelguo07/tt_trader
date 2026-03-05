import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    include: { reviewer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const stats = await prisma.review.aggregate({
    where: { revieweeId: userId },
    _avg: { rating: true },
    _count: true,
  });
  return NextResponse.json({
    reviews,
    averageRating: stats._avg.rating ?? 0,
    totalCount: stats._count,
  });
}
