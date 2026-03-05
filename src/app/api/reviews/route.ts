import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  revieweeId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  listingId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = createSchema.parse({
      ...body,
      rating: body.rating != null ? Number(body.rating) : undefined,
    });
    if (data.revieweeId === session.user.id) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        revieweeId: data.revieweeId,
        rating: data.rating,
        comment: data.comment ?? null,
        listingId: data.listingId ?? null,
      },
    });
    return NextResponse.json(review);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
