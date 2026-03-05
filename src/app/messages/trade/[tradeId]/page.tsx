import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MessageThread } from '@/components/MessageThread';

export default async function TradeMessagePage({ params }: { params: Promise<{ tradeId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const { tradeId } = await params;
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId, status: 'active' },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!trade) notFound();
  if (trade.userId === session.user.id) redirect(`/trades/${tradeId}`);

  const threadId = `trade-${tradeId}`;
  const messages = await prisma.message.findMany({
    where: {
      threadId,
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <p className="text-stone-600 mb-2">
        <Link href={`/trades/${tradeId}`} className="text-primary-600 hover:underline">← Back to trade</Link>
      </p>
      <h1 className="text-xl font-bold mb-4">Message about trade</h1>
      <MessageThread
        threadId={threadId}
        receiverId={trade.user.id}
        currentUserId={session.user.id}
        initialMessages={messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          senderId: m.senderId,
          senderName: m.sender.name,
        }))}
      />
    </div>
  );
}
