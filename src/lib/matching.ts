import { prisma } from './prisma';

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

export async function notifyMatchingUsersForNewListing(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: true },
  });
  if (!listing || listing.status !== 'active') return;

  const listingLat = listing.latitude;
  const listingLng = listing.longitude;

  // 1) Saved searches: match query/category/condition/price and distance
  const savedSearches = await prisma.savedSearch.findMany({
    where: {
      userId: { not: listing.sellerId },
      OR: [
        { category: listing.category },
        { category: null },
      ],
    },
    include: { user: { select: { id: true } } },
  });

  const notifiedUserIds = new Set<string>();

  for (const search of savedSearches) {
    if (search.userId === listing.sellerId) continue;
    if (notifiedUserIds.has(search.userId)) continue;

    if (search.condition != null && search.condition !== listing.condition) continue;
    if (search.minPrice != null && listing.price < search.minPrice) continue;
    if (search.maxPrice != null && listing.price > search.maxPrice) continue;
    if (search.query?.trim()) {
      const q = search.query.toLowerCase();
      if (!listing.title.toLowerCase().includes(q) && !listing.description.toLowerCase().includes(q)) continue;
    }

    let withinRange = true;
    if (search.maxDistanceKm != null && search.maxDistanceKm > 0 && search.latitude != null && search.longitude != null && listingLat != null && listingLng != null) {
      const dist = haversineKm(search.latitude, search.longitude, listingLat, listingLng);
      if (dist > search.maxDistanceKm) withinRange = false;
    }
    if (!withinRange) continue;

    await prisma.matchNotification.create({
      data: {
        userId: search.userId,
        listingId: listing.id,
        message: `Someone is selling "${listing.title}" (${listing.currency} ${listing.price.toFixed(2)}) – matches your saved search.`,
      },
    });
    notifiedUserIds.add(search.userId);
  }

  // 2) Favourites: users who favourited a similar listing (same category or same title search) - we don't have "wishlist a search", we have favourite a listing. So when a NEW listing is created, we don't match against favourites (favourites are for specific listings). So we only use saved searches for "someone listed X and you wanted X". Optionally: users who have this listing's category in a saved search with no query could get notified. We already did saved searches above.
  // So we're done. Optionally add: notify users who favourited any listing in same category and have a saved search for that category with location - to avoid duplicate we only use saved searches.
}
