'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LISTING_CATEGORIES } from '@/lib/constants';

type Trade = {
  id: string;
  haveText: string;
  wantText: string;
  note: string | null;
  category: string | null;
  locationLabel: string | null;
  createdAt: string;
  user: { id: string; name: string | null; locationLabel: string | null };
};

export function TradesClient() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    params.set('page', String(page));
    setLoading(true);
    fetch(`/api/trades?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setTrades(data.trades ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [category, q, page]);

  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Search have/want</label>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="border border-stone-300 rounded-md px-3 py-2 w-48"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-stone-300 rounded-md px-3 py-2"
          >
            <option value="">All</option>
            {LISTING_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading...</p>
      ) : (
        <>
          <p className="text-stone-600">{total} trade{total !== 1 ? 's' : ''}</p>
          <div className="space-y-4">
            {trades.map((t) => (
              <Link
                key={t.id}
                href={`/trades/${t.id}`}
                className="block border border-stone-200 rounded-lg p-4 bg-white hover:shadow-md transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-stone-500 uppercase">Have</p>
                    <p className="text-stone-800 whitespace-pre-wrap">{t.haveText}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-500 uppercase">Want</p>
                    <p className="text-stone-800 whitespace-pre-wrap">{t.wantText}</p>
                  </div>
                </div>
                {t.note && <p className="text-stone-600 text-sm mt-2">{t.note}</p>}
                <p className="text-stone-500 text-sm mt-2">
                  {t.user.name ?? 'User'} · {t.locationLabel ?? '—'}
                </p>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">Page {page} of {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
