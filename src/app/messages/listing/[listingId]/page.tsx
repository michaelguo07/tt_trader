import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MessageThread } from '@/components/MessageThread';

export default async function ListingMessagePage({ params }: { params: Promise<{ listingId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const { listingId } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id: listingId, status: 'active' },
    include: { seller: { select: { id: true, name: true } } },
  });
  if (!listing) notFound();
  if (listing.sellerId === session.user.id) redirect(`/listings/${listingId}`);

  const threadId = `listing-${listingId}`;
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
        <Link href={`/listings/${listingId}`} className="text-primary-600 hover:underline">← Back to listing</Link>
      </p>
      <h1 className="text-xl font-bold mb-4">Message about: {listing.title}</h1>
      <MessageThread
        threadId={threadId}
        receiverId={listing.seller.id}
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
