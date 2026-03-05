import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const favourites = await prisma.favourite.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        include: {
          seller: { select: { name: true, locationLabel: true } },
        },
      },
    },
    orderBy: { id: 'desc' },
  });
  const listings = favourites
    .filter((f) => f.listing.status === 'active')
    .map((f) => ({
      ...f.listing,
      imageUrls: JSON.parse((f.listing.imageUrls as string) || '[]'),
      seller: f.listing.seller,
    }));
  return NextResponse.json({ listings });
}
