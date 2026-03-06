import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ListingsNearYou } from '@/components/ListingsNearYou';

export default async function HomePage() {
  let session = null;
  let recentListings: Awaited<ReturnType<typeof prisma.listing.findMany<{
    include: { seller: { select: { name: true; locationLabel: true } } };
  }>>> = [];
  try {
    session = await getServerSession(authOptions);
    recentListings = await prisma.listing.findMany({
      where: { status: 'active' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { name: true, locationLabel: true } } },
    });
  } catch (e) {
    console.error('HomePage DB error:', e);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Table Tennis Buy, Sell & Trade</h1>
        <p className="text-stone-600 mb-6">
          Find blades, rubbers, and gear from sellers near you. Post what you have and what you want to trade.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/listings"
            className="bg-primary-500 text-white px-5 py-2.5 rounded-lg hover:bg-primary-600 font-medium"
          >
            Browse listings
          </Link>
          <Link href="/trades" className="border border-stone-300 px-5 py-2.5 rounded-lg hover:bg-stone-100 font-medium">
            View trades
          </Link>
          {!session && (
            <Link href="/signup" className="border border-primary-500 text-primary-600 px-5 py-2.5 rounded-lg hover:bg-primary-50 font-medium">
              Sign up to sell or trade
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentListings.map((l) => {
            const images = (JSON.parse(l.imageUrls || '[]') as string[]);
            const firstImage = images[0];
            return (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="block border border-stone-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition"
              >
                <div className="aspect-[4/3] bg-stone-100 flex items-center justify-center">
                  {firstImage ? (
                    <img src={firstImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-stone-400 text-sm">No image</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{l.title}</h3>
                  <p className="text-primary-600 font-semibold">
                    {l.currency} {l.price.toFixed(2)}
                  </p>
                  <p className="text-stone-500 text-sm">{l.seller?.locationLabel ?? '—'}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <Link href="/listings" className="text-primary-600 hover:underline font-medium">
            View all listings →
          </Link>
        </div>
      </section>

      <ListingsNearYou />
    </div>
  );
}
