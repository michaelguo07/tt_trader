import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { geocode } from '@/lib/geocode';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id, status: 'active' },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          locationLabel: true,
          latitude: true,
          longitude: true,
          isReseller: true,
          createdAt: true,
        },
      },
    },
  });
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const imageUrls = JSON.parse((listing.imageUrls as string) || '[]') as string[];
  const session = await getServerSession(authOptions);
  let isFavourited = false;
  if (session?.user?.id) {
    const fav = await prisma.favourite.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId: id } },
    });
    isFavourited = !!fav;
  }
  return NextResponse.json({ ...listing, imageUrls, seller: listing.seller, isFavourited });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }
  const body = await req.json();
  const {
    title,
    description,
    category,
    condition,
    price,
    currency,
    imageUrls,
    locationLabel,
    latitude,
    longitude,
    maxDistanceKm,
    status,
  } = body;
  let lat = latitude;
  let lng = longitude;
  if ((lat === undefined || lng === undefined) && locationLabel?.trim()) {
    const coords = await geocode(locationLabel);
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }
  const updated = await prisma.listing.update({
    where: { id },
    data: {
      ...(title != null && { title }),
      ...(description != null && { description }),
      ...(category != null && { category }),
      ...(condition != null && { condition }),
      ...(price != null && { price: parseFloat(price) }),
      ...(currency != null && { currency }),
      ...(Array.isArray(imageUrls) && { imageUrls: JSON.stringify(imageUrls) }),
      ...(locationLabel !== undefined && { locationLabel }),
      ...(lat !== undefined && { latitude: lat }),
      ...(lng !== undefined && { longitude: lng }),
      ...(maxDistanceKm !== undefined && { maxDistanceKm: maxDistanceKm === null ? null : parseFloat(maxDistanceKm) }),
      ...(status != null && { status }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }
  await prisma.listing.update({ where: { id }, data: { status: 'removed' } });
  return NextResponse.json({ ok: true });
}
