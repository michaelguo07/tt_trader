import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { LeaveReviewForm } from '@/components/LeaveReviewForm';
import { ReportButton } from '@/components/ReportButton';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      locationLabel: true,
      isReseller: true,
      showApproximateOnly: true,
    },
  });
  if (!user) notFound();

  const [listings, trades, reviewsData] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: id, status: 'active' },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.trade.findMany({
      where: { userId: id, status: 'active' },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { revieweeId: id },
      include: { reviewer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const avgRating =
    reviewsData.length > 0
      ? reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length
      : null;

  const isSelf = session?.user?.id === id;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold">{user.name ?? 'User'}</h1>
      {user.isReseller && (
        <span className="inline-block text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded mt-1">
          Reseller
        </span>
      )}
      {user.bio && <p className="text-stone-600 mt-2">{user.bio}</p>}
      <p className="text-stone-500 text-sm mt-1">
        Location: {user.locationLabel ?? '—'}
      </p>

      {!isSelf && session && (
        <div className="mt-2">
          <ReportButton userId={id} />
        </div>
      )}

      {avgRating != null && (
        <p className="text-stone-600 mt-2">
          ★ {avgRating.toFixed(1)} ({reviewsData.length} review{reviewsData.length !== 1 ? 's' : ''})
        </p>
      )}

      {!isSelf && session && (
        <LeaveReviewForm revieweeId={id} revieweeName={user.name ?? 'User'} />
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Reviews</h2>
        {reviewsData.length === 0 ? (
          <p className="text-stone-500">No reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviewsData.map((r) => (
              <li key={r.id} className="border-l-2 border-stone-200 pl-3">
                <p className="text-stone-800">★ {r.rating} · {r.reviewer.name ?? 'User'}</p>
                {r.comment && <p className="text-stone-600 text-sm">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Listings</h2>
        {listings.length === 0 ? (
          <p className="text-stone-500">No active listings.</p>
        ) : (
          <ul className="space-y-2">
            {listings.map((l) => (
              <li key={l.id}>
                <Link href={`/listings/${l.id}`} className="text-primary-600 hover:underline">
                  {l.title}
                </Link>
                <span className="text-stone-500 ml-2">{l.currency} {l.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Trades</h2>
        {trades.length === 0 ? (
          <p className="text-stone-500">No active trade posts.</p>
        ) : (
          <ul className="space-y-2">
            {trades.map((t) => (
              <li key={t.id}>
                <Link href={`/trades/${t.id}`} className="text-primary-600 hover:underline">
                  {t.haveText.slice(0, 50)}...
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
