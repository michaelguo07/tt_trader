import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReportActions } from '@/components/ReportActions';

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const isAdmin = process.env.ADMIN_USER_ID === session.user.id;
  if (!isAdmin) redirect('/');

  const reports = await prisma.report.findMany({
    where: { status: 'pending' },
    include: {
      reporter: { select: { name: true, email: true } },
      listing: { select: { id: true, title: true, status: true } },
      trade: { select: { id: true, haveText: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      {reports.length === 0 ? (
        <p className="text-stone-600">No pending reports.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="border border-stone-200 rounded-lg p-4">
              <p className="font-medium">{r.reason}</p>
              {r.details && <p className="text-stone-600 text-sm mt-1">{r.details}</p>}
              <p className="text-stone-500 text-xs mt-1">
                By {r.reporter.name ?? r.reporter.email} · {new Date(r.createdAt).toLocaleString()}
              </p>
              {r.listing && (
                <p className="text-sm mt-2">
                  Listing: <a href={`/listings/${r.listing.id}`} className="text-primary-600 hover:underline">{r.listing.title}</a>
                </p>
              )}
              {r.trade && (
                <p className="text-sm mt-2">
                  Trade: <a href={`/trades/${r.trade.id}`} className="text-primary-600 hover:underline">{r.trade.haveText.slice(0, 40)}...</a>
                </p>
              )}
              {r.userId && <p className="text-sm mt-2">User ID: {r.userId}</p>}
              <ReportActions reportId={r.id} listingId={r.listingId} tradeId={r.tradeId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
