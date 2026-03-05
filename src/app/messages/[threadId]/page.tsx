import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MessageThread } from '@/components/MessageThread';

export default async function MessageThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const { threadId } = await params;
  const decoded = decodeURIComponent(threadId);
  const messages = await prisma.message.findMany({
    where: {
      threadId: decoded,
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
  if (messages.length === 0) notFound();
  const other = messages[0].senderId === session.user.id ? messages[0].receiver : messages[0].sender;
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">Chat with {other.name ?? 'User'}</h1>
      <MessageThread
        threadId={decoded}
        receiverId={other.id}
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
