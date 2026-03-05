import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function FavouritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const favourites = await prisma.favourite.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        include: { seller: { select: { name: true, locationLabel: true } } },
      },
    },
    orderBy: { id: 'desc' },
  });
  const listings = favourites.filter((f) => f.listing.status === 'active').map((f) => f.listing);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Favourites</h1>
      {listings.length === 0 ? (
        <p className="text-stone-600">
          No saved listings. <Link href="/listings" className="text-primary-600 hover:underline">Browse listings</Link> and click the heart to save.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => {
            const imageUrls = (JSON.parse((l.imageUrls as string) || '[]') as string[]);
            return (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="block border border-stone-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition"
              >
                <div className="aspect-[4/3] bg-stone-100 flex items-center justify-center">
                  {imageUrls[0] ? (
                    <img src={imageUrls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-stone-400 text-sm">No image</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{l.title}</h3>
                  <p className="text-primary-600 font-semibold">{l.currency} {l.price.toFixed(2)}</p>
                  <p className="text-stone-500 text-sm">{l.seller.locationLabel ?? '—'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
