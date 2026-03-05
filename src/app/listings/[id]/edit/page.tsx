import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ListingForm } from '@/components/ListingForm';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.sellerId !== session.user.id) notFound();

  const imageUrls = (JSON.parse((listing.imageUrls as string) || '[]') as string[]);
  const initial = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    condition: listing.condition,
    price: listing.price,
    currency: listing.currency,
    imageUrls,
    locationLabel: listing.locationLabel ?? '',
    maxDistanceKm: listing.maxDistanceKm,
    status: listing.status,
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit listing</h1>
      <ListingForm initial={initial} />
    </div>
  );
}
