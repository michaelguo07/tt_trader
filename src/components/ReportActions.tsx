'use client';

import { useRouter } from 'next/navigation';

export function ReportActions({
  reportId,
  listingId,
  tradeId,
}: {
  reportId: string;
  listingId: string | null;
  tradeId: string | null;
}) {
  const router = useRouter();

  async function action(opts: { status: string; removeListing?: boolean; removeTrade?: boolean }) {
    await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        type="button"
        onClick={() => action({ status: 'dismissed' })}
        className="text-stone-500 hover:text-stone-700 text-sm"
      >
        Dismiss
      </button>
      {listingId && (
        <button
          type="button"
          onClick={() => action({ status: 'reviewed', removeListing: true })}
          className="text-red-600 hover:underline text-sm"
        >
          Remove listing
        </button>
      )}
      {tradeId && (
        <button
          type="button"
          onClick={() => action({ status: 'reviewed', removeTrade: true })}
          className="text-red-600 hover:underline text-sm"
        >
          Remove trade
        </button>
      )}
      {!listingId && !tradeId && (
        <button
          type="button"
          onClick={() => action({ status: 'reviewed' })}
          className="text-stone-600 hover:underline text-sm"
        >
          Mark reviewed
        </button>
      )}
    </div>
  );
}
