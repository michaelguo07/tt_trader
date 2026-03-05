import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TradeForm } from '@/components/TradeForm';

export default async function NewTradePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Post a trade</h1>
      <p className="text-stone-600 mb-6">
        Describe what you have and what you want in return. Optionally add your location and how far you&apos;re willing to travel.
      </p>
      <TradeForm />
    </div>
  );
}
