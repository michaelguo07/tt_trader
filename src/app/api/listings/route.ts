import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') ?? undefined;
  const condition = searchParams.get('condition') ?? undefined;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const q = searchParams.get('q') ?? undefined;
  const sort = searchParams.get('sort') ?? 'newest';
  const withinKm = searchParams.get('withinKm');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(24, Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: 'active' };
  if (category) where.category = category;
  if (condition) where.condition = condition;
  if (minPrice != null && minPrice !== '') where.price = { ...((where.price as object) || {}), gte: parseFloat(minPrice) };
  if (maxPrice != null && maxPrice !== '') where.price = { ...((where.price as object) || {}), lte: parseFloat(maxPrice) };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  // Distance filter: if lat, lng, withinKm provided, filter by Haversine (simplified: we need lat/lng on listing)
  let orderBy: Record<string, string> = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'distance' && lat != null && lng != null) {
    // For SQLite we don't have native geo; we'll sort in JS or use raw. For now skip distance sort in API and do in memory for small sets, or add optional lat/lng filter.
    orderBy = { createdAt: 'desc' };
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        seller: { select: { id: true, name: true, locationLabel: true, latitude: true, longitude: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  // If distance sort requested and we have user coords, compute distance and re-sort (listings have lat/lng)
  let results = listings;
  const userLat = lat ? parseFloat(lat) : null;
  const userLng = lng ? parseFloat(lng) : null;
  const withinKmNum = withinKm ? parseFloat(withinKm) : null;

  if (userLat != null && userLng != null) {
    const withDistance = results.map((l) => {
      const d = haversineKm(userLat, userLng, l.latitude ?? 0, l.longitude ?? 0);
      return { ...l, _distanceKm: l.latitude != null ? d : null };
    });
    if (withinKmNum != null && withinKmNum > 0) {
      results = withDistance.filter((l) => l._distanceKm != null && l._distanceKm <= withinKmNum);
    } else {
      results = withDistance;
    }
    if (sort === 'distance') {
      results = [...results].sort((a, b) => {
        const da = (a as { _distanceKm?: number | null })._distanceKm ?? 1e9;
        const db = (b as { _distanceKm?: number | null })._distanceKm ?? 1e9;
        return da - db;
      });
    }
  }

  return NextResponse.json({
    listings: results.map(({ seller, ...l }) => ({
      ...l,
      imageUrls: JSON.parse((l.imageUrls as string) || '[]'),
      seller,
      _distanceKm: (l as { _distanceKm?: number | null })._distanceKm,
    })),
    total,
    page,
    limit,
  });
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
