import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MarkReadButton } from '@/components/MarkReadButton';

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const notifications = await prisma.matchNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Matches for you</h1>
      <p className="text-stone-600 mb-6">
        When a new listing matches your saved search and is within your chosen distance, we&apos;ll add it here.
      </p>
      {notifications.length === 0 ? (
        <p className="text-stone-600">
          No matches yet. <Link href="/listings" className="text-primary-600 hover:underline">Save a search</Link> on the Listings page to get alerts.
        </p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`border rounded-lg p-4 ${n.readAt ? 'bg-stone-50 border-stone-200' : 'bg-primary-50/50 border-primary-200'}`}
            >
              <p className="text-stone-800">{n.message}</p>
              <div className="flex items-center gap-2 mt-2">
                {n.listingId && (
                  <Link
                    href={`/listings/${n.listingId}`}
                    className="text-primary-600 hover:underline text-sm font-medium"
                  >
                    View listing →
                  </Link>
                )}
                {n.tradeId && (
                  <Link
                    href={`/trades/${n.tradeId}`}
                    className="text-primary-600 hover:underline text-sm font-medium"
                  >
                    View trade →
                  </Link>
                )}
                {!n.readAt && <MarkReadButton notificationId={n.id} />}
              </div>
              <p className="text-stone-500 text-xs mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
