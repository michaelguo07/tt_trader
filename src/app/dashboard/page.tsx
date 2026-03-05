import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const [listings, trades, favourites, savedSearches] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.favourite.findMany({
      where: { userId: session.user.id },
      include: { listing: true },
      orderBy: { id: 'desc' },
      take: 10,
    }),
    prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { id: 'desc' },
      take: 10,
    }),
  ]);

  const activeListings = listings.filter((l) => l.status === 'active');
  const activeTrades = trades.filter((t) => t.status === 'active');
  const favouriteListings = favourites.filter((f) => f.listing.status === 'active');

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">My listings</h2>
        {activeListings.length === 0 ? (
          <p className="text-stone-600">
            <Link href="/listings/new" className="text-primary-600 hover:underline">Create a listing</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {activeListings.map((l) => (
              <li key={l.id}>
                <Link href={`/listings/${l.id}/edit`} className="text-primary-600 hover:underline">
                  {l.title}
                </Link>
                <span className="text-stone-500 ml-2">{l.currency} {l.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">My trades</h2>
        {activeTrades.length === 0 ? (
          <p className="text-stone-600">
            <Link href="/trades/new" className="text-primary-600 hover:underline">Post a trade</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {activeTrades.map((t) => (
              <li key={t.id}>
                <Link href={`/trades/${t.id}`} className="text-primary-600 hover:underline">
                  {t.haveText.slice(0, 50)}...
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Favourites</h2>
        {favouriteListings.length === 0 ? (
          <p className="text-stone-600">Save listings from their page to see them here.</p>
        ) : (
          <ul className="space-y-2">
            {favouriteListings.map((f) => (
              <li key={f.listing.id}>
                <Link href={`/listings/${f.listing.id}`} className="text-primary-600 hover:underline">
                  {f.listing.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/dashboard/favourites" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
          View all favourites
        </Link>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Saved searches</h2>
        {savedSearches.length === 0 ? (
          <p className="text-stone-600">
            Save a search from the <Link href="/listings" className="text-primary-600 hover:underline">Listings</Link> page to get alerts when new items match.
          </p>
        ) : (
          <ul className="space-y-2">
            {savedSearches.map((s) => (
              <li key={s.id}>
                <span className="text-stone-800">
                  {s.query || 'Any'} {s.category && `· ${s.category}`} {s.maxDistanceKm != null && `· within ${s.maxDistanceKm} km`}
                </span>
                <Link href={`/listings?q=${encodeURIComponent(s.query ?? '')}&category=${s.category ?? ''}&withinKm=${s.maxDistanceKm ?? ''}`} className="text-primary-600 hover:underline ml-2 text-sm">
                  Run
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Matches for you</h2>
        <p className="text-stone-600">
          <Link href="/dashboard/matches" className="text-primary-600 hover:underline">View matches</Link> from your saved searches and wishlist.
        </p>
      </section>
    </div>
  );
}
