import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ListingsClient } from '@/components/ListingsClient';

export default async function ListingsPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // DB may not be ready yet
  }
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Listings</h1>
      <ListingsClient isLoggedIn={!!session?.user?.id} />
    </div>
  );
}
