import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  query: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  minPrice: z.number().nullable().optional(),
  maxPrice: z.number().nullable().optional(),
  maxDistanceKm: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const searches = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { id: 'desc' },
  });
  return NextResponse.json({ savedSearches: searches });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = createSchema.parse({
      ...body,
      minPrice: body.minPrice != null ? Number(body.minPrice) : null,
      maxPrice: body.maxPrice != null ? Number(body.maxPrice) : null,
      maxDistanceKm: body.maxDistanceKm != null && body.maxDistanceKm !== '' ? Number(body.maxDistanceKm) : null,
      latitude: body.latitude != null ? Number(body.latitude) : null,
      longitude: body.longitude != null ? Number(body.longitude) : null,
    });
    const search = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        query: data.query ?? null,
        category: data.category ?? null,
        condition: data.condition ?? null,
        minPrice: data.minPrice ?? null,
        maxPrice: data.maxPrice ?? null,
        maxDistanceKm: data.maxDistanceKm ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      },
    });
    return NextResponse.json(search);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
