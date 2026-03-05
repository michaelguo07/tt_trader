'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LISTING_CATEGORIES } from '@/lib/constants';
import { MAX_DISTANCE_OPTIONS } from '@/lib/constants';

type Initial = {
  id: string;
  haveText: string;
  wantText: string;
  note: string;
  category: string;
  locationLabel: string;
  maxDistanceKm: number | null;
};

export function TradeForm({ initial }: { initial?: Initial }) {
  const isEdit = !!initial;
  const [haveText, setHaveText] = useState(initial?.haveText ?? '');
  const [wantText, setWantText] = useState(initial?.wantText ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [locationLabel, setLocationLabel] = useState(initial?.locationLabel ?? '');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | ''>(
    initial?.maxDistanceKm != null ? initial.maxDistanceKm : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      haveText,
      wantText,
      note: note || null,
      category: category || null,
      locationLabel: locationLabel || null,
      maxDistanceKm: maxDistanceKm === '' ? null : Number(maxDistanceKm),
    };
    const url = isEdit ? `/api/trades/${initial!.id}` : '/api/trades';
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEdit ? payload : payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to save');
      return;
    }
    const data = await res.json();
    router.push(isEdit ? `/trades/${initial!.id}` : `/trades/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="haveText" className="block text-sm font-medium text-stone-700 mb-1">
          I have
        </label>
        <textarea
          id="haveText"
          value={haveText}
          onChange={(e) => setHaveText(e.target.value)}
          required
          rows={3}
          placeholder="e.g. Butterfly Viscaria blade, used 6 months"
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="wantText" className="block text-sm font-medium text-stone-700 mb-1">
          I want
        </label>
        <textarea
          id="wantText"
          value={wantText}
          onChange={(e) => setWantText(e.target.value)}
          required
          rows={3}
          placeholder="e.g. Stiga Carbon blade or equivalent"
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-stone-700 mb-1">
          Note (optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-1">
          Category (optional)
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        >
          <option value="">Any</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="locationLabel" className="block text-sm font-medium text-stone-700 mb-1">
          Your location (optional)
        </label>
        <input
          id="locationLabel"
          type="text"
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
          placeholder="e.g. Berlin, Germany"
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="maxDistanceKm" className="block text-sm font-medium text-stone-700 mb-1">
          Max distance you&apos;re willing to travel to trade (optional)
        </label>
        <select
          id="maxDistanceKm"
          value={maxDistanceKm === '' ? '' : String(maxDistanceKm)}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') setMaxDistanceKm('');
            else setMaxDistanceKm(parseInt(v, 10));
          }}
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        >
          <option value="">—</option>
          {MAX_DISTANCE_OPTIONS.filter((o) => o.value >= 0).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 font-medium disabled:opacity-50"
      >
        {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Post trade'}
      </button>
    </form>
  );
}
