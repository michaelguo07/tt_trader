import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { geocode } from '@/lib/geocode';
import { notifyMatchingUsersForNewListing } from '@/lib/matching';
import { LISTING_CATEGORIES, LISTING_CONDITIONS, CURRENCIES } from '@/lib/constants';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.enum(LISTING_CATEGORIES as unknown as [string, ...string[]]),
  condition: z.enum(LISTING_CONDITIONS as unknown as [string, ...string[]]),
  price: z.number().min(0),
  currency: z.enum(CURRENCIES as unknown as [string, ...string[]]).optional(),
  imageUrls: z.array(z.string().url()).max(10).default([]),
  locationLabel: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  maxDistanceKm: z.number().min(-1).nullable().optional(), // -1 = ship anywhere
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = createSchema.parse({
      ...body,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      maxDistanceKm: body.maxDistanceKm === '' || body.maxDistanceKm === undefined ? null : (typeof body.maxDistanceKm === 'string' ? parseFloat(body.maxDistanceKm) : body.maxDistanceKm),
    });
    let latitude = data.latitude ?? undefined;
    let longitude = data.longitude ?? undefined;
    if ((latitude == null || longitude == null) && data.locationLabel?.trim()) {
      const coords = await geocode(data.locationLabel);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }
    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
        price: data.price,
        currency: data.currency ?? 'EUR',
        imageUrls: JSON.stringify(data.imageUrls),
        locationLabel: data.locationLabel ?? undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        maxDistanceKm: data.maxDistanceKm === -1 ? null : data.maxDistanceKm,
      },
    });
    notifyMatchingUsersForNewListing(listing.id).catch(() => {});
    return NextResponse.json(listing);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}
