import { TradesClient } from '@/components/TradesClient';

export default function TradesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Trades</h1>
      <p className="text-stone-600 mb-6">
        Post what you have and what you want in return. Find trade partners near you.
      </p>
      <TradesClient />
    </div>
  );
}
