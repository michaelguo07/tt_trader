import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const sent = await prisma.message.findMany({
    where: { senderId: session.user.id },
    select: { threadId: true },
    distinct: ['threadId'],
  });
  const received = await prisma.message.findMany({
    where: { receiverId: session.user.id },
    select: { threadId: true },
    distinct: ['threadId'],
  });
  const threadIds = [...new Set([...sent.map((m) => m.threadId), ...received.map((m) => m.threadId)])];
  const threads: { threadId: string; other: { id: string; name: string | null }; lastMessage: string; lastAt: Date }[] = [];
  for (const tid of threadIds) {
    const last = await prisma.message.findFirst({
      where: { threadId: tid },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
    if (!last) continue;
    const other = last.senderId === session.user.id ? last.receiver : last.sender;
    threads.push({
      threadId: tid,
      other: { id: other.id, name: other.name },
      lastMessage: last.body.slice(0, 80),
      lastAt: last.createdAt,
    });
  }
  threads.sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      {threads.length === 0 ? (
        <p className="text-stone-600">No conversations yet. Contact a seller or trade poster from their listing/trade page to start.</p>
      ) : (
        <ul className="space-y-2">
          {threads.map((t) => (
            <li key={t.threadId}>
              <Link
                href={`/messages/${encodeURIComponent(t.threadId)}`}
                className="block border border-stone-200 rounded-lg p-4 hover:bg-stone-50"
              >
                <p className="font-medium">{t.other.name ?? 'User'}</p>
                <p className="text-stone-600 text-sm truncate">{t.lastMessage}</p>
                <p className="text-stone-500 text-xs">{new Date(t.lastAt).toLocaleString()}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
