import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TradeForm } from '@/components/TradeForm';

export default async function EditTradePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const { id } = await params;
  const trade = await prisma.trade.findUnique({ where: { id } });
  if (!trade || trade.userId !== session.user.id) notFound();

  const initial = {
    id: trade.id,
    haveText: trade.haveText,
    wantText: trade.wantText,
    note: trade.note ?? '',
    category: trade.category ?? '',
    locationLabel: trade.locationLabel ?? '',
    maxDistanceKm: trade.maxDistanceKm,
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit trade post</h1>
      <TradeForm initial={initial} />
    </div>
  );
}
