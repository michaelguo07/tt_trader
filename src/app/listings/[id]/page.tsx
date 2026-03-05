import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContactSeller } from '@/components/ContactSeller';
import { FavouriteButton } from '@/components/FavouriteButton';
import { ReportButton } from '@/components/ReportButton';

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const listing = await prisma.listing.findUnique({
    where: { id, status: 'active' },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          locationLabel: true,
          isReseller: true,
        },
      },
    },
  });
  if (!listing) notFound();

  let isFavourited = false;
  if (session?.user?.id) {
    const fav = await prisma.favourite.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId: id } },
    });
    isFavourited = !!fav;
  }

  const imageUrls = (JSON.parse((listing.imageUrls as string) || '[]') as string[]);
  const isOwner = session?.user?.id === listing.sellerId;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {imageUrls.length > 0 ? (
            imageUrls.map((url, i) => (
              <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-stone-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <div className="aspect-[4/3] rounded-lg bg-stone-100 flex items-center justify-center">
              <span className="text-stone-400">No image</span>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold flex-1">{listing.title}</h1>
            {!isOwner && session && <FavouriteButton listingId={listing.id} initial={isFavourited} />}
          </div>
          <p className="text-primary-600 text-xl font-semibold mt-1">
            {listing.currency} {listing.price.toFixed(2)}
          </p>
          <p className="text-stone-500 text-sm mt-1">
            {listing.category} · {listing.condition}
          </p>
          <p className="text-stone-500 text-sm">
            Location: {listing.locationLabel ?? listing.seller.locationLabel ?? '—'}
            {listing.maxDistanceKm != null && listing.maxDistanceKm >= 0 && (
              <> · Willing to deliver/meet within {listing.maxDistanceKm} km</>
            )}
            {listing.maxDistanceKm == null && ' · Willing to ship anywhere'}
          </p>
          <div className="mt-4 prose text-stone-700 whitespace-pre-wrap">{listing.description}</div>
        <div className="mt-6 pt-4 border-t border-stone-200">
          <p className="text-sm font-medium text-stone-700">Seller</p>
          <p className="text-stone-600">{listing.seller.name ?? 'User'}</p>
            {listing.seller.isReseller && (
              <span className="inline-block text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded mt-1">
                Reseller
              </span>
            )}
            {!isOwner && session && (
              <div className="flex gap-2 mt-2">
                <Link
                  href={`/messages/listing/${listing.id}`}
                  className="inline-block bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 font-medium text-sm"
                >
                  Message seller
                </Link>
                <ContactSeller sellerEmail={listing.seller.email} listingTitle={listing.title} />
              </div>
            )}
            {!isOwner && (
              <p className="text-sm text-stone-500 mt-2">
                <Link href={`/users/${listing.seller.id}`} className="text-primary-600 hover:underline">View profile & reviews</Link>
              </p>
            )}
            {!isOwner && !session && (
              <p className="text-sm text-stone-500 mt-2">
                <Link href="/login" className="text-primary-600 hover:underline">Log in</Link> to contact seller.
              </p>
            )}
            {isOwner && (
              <Link
                href={`/listings/${listing.id}/edit`}
                className="inline-block mt-2 text-primary-600 hover:underline text-sm"
              >
                Edit listing
              </Link>
            )}
            {!isOwner && session && (
              <div className="mt-2">
                <ReportButton listingId={listing.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
