import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  reason: z.string().min(1).max(200),
  details: z.string().max(1000).optional(),
  listingId: z.string().optional(),
  tradeId: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    if (!data.listingId && !data.tradeId && !data.userId) {
      return NextResponse.json({ error: 'Must report a listing, trade, or user' }, { status: 400 });
    }
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reason: data.reason,
        details: data.details ?? null,
        listingId: data.listingId ?? null,
        tradeId: data.tradeId ?? null,
        userId: data.userId ?? null,
      },
    });
    return NextResponse.json(report);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
