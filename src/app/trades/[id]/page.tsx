import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContactSeller } from '@/components/ContactSeller';
import { ReportButton } from '@/components/ReportButton';

export default async function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const trade = await prisma.trade.findUnique({
    where: { id, status: 'active' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          locationLabel: true,
        },
      },
    },
  });
  if (!trade) notFound();

  const isOwner = session?.user?.id === trade.userId;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border border-stone-200 rounded-lg p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-medium text-stone-500 uppercase mb-2">Have</h2>
            <p className="text-stone-800 whitespace-pre-wrap">{trade.haveText}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-stone-500 uppercase mb-2">Want</h2>
            <p className="text-stone-800 whitespace-pre-wrap">{trade.wantText}</p>
          </div>
        </div>
        {trade.note && (
          <p className="text-stone-600 border-t border-stone-200 pt-4 mb-4">{trade.note}</p>
        )}
        <p className="text-stone-500 text-sm">
          Location: {trade.locationLabel ?? trade.user.locationLabel ?? '—'}
          {trade.maxDistanceKm != null && trade.maxDistanceKm >= 0 && (
            <> · Willing to travel up to {trade.maxDistanceKm} km</>
          )}
        </p>
        <div className="mt-6 pt-4 border-t border-stone-200">
          <p className="text-sm font-medium text-stone-700">Posted by {trade.user.name ?? 'User'}</p>
          {!isOwner && session && (
            <div className="flex gap-2 mt-2">
              <Link
                href={`/messages/trade/${trade.id}`}
                className="inline-block bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 font-medium text-sm"
              >
                Message
              </Link>
              <ContactSeller sellerEmail={trade.user.email} listingTitle={`Trade: ${trade.haveText.slice(0, 30)}...`} />
            </div>
          )}
          {!isOwner && !session && (
            <p className="text-sm text-stone-500 mt-2">
              <Link href="/login" className="text-primary-600 hover:underline">Log in</Link> to contact.
            </p>
          )}
          {isOwner && (
            <Link href={`/trades/${trade.id}/edit`} className="inline-block mt-2 text-primary-600 hover:underline text-sm">
              Edit trade post
            </Link>
          )}
          {!isOwner && session && (
            <div className="mt-2">
              <ReportButton tradeId={trade.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
