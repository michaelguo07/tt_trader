import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { geocode } from '@/lib/geocode';

const updateSchema = z.object({
  name: z.string().nullable(),
  bio: z.string().nullable(),
  locationLabel: z.string().nullable(),
  showApproximateOnly: z.boolean().optional(),
  isReseller: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      locationLabel: true,
      latitude: true,
      longitude: true,
      showApproximateOnly: true,
      isReseller: true,
    },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    let latitude: number | undefined;
    let longitude: number | undefined;
    if (data.locationLabel?.trim()) {
      const coords = await geocode(data.locationLabel);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name ?? undefined,
        bio: data.bio ?? undefined,
        locationLabel: data.locationLabel ?? undefined,
        showApproximateOnly: data.showApproximateOnly,
        isReseller: data.isReseller,
        ...(latitude != null && { latitude }),
        ...(longitude != null && { longitude }),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
