'use client';

import { useState } from 'react';

type Props = {
  listingId?: string;
  tradeId?: string;
  userId?: string;
  label?: string;
};

export function ReportButton({ listingId, tradeId, userId, label = 'Report' }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.trim(), details: details.trim() || undefined, listingId, tradeId, userId }),
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      setOpen(false);
    }
  }

  if (done) return <span className="text-stone-500 text-sm">Report submitted</span>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-stone-500 hover:text-red-600 text-sm"
      >
        {label}
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="mt-2 p-3 border border-stone-200 rounded-lg bg-white shadow-lg">
          <label className="block text-sm font-medium mb-1">Reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            maxLength={200}
            className="w-full border border-stone-300 rounded px-2 py-1 text-sm mb-2"
            placeholder="e.g. Spam, misleading, prohibited item"
          />
          <label className="block text-sm font-medium mb-1">Details (optional)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={1000}
            rows={2}
            className="w-full border border-stone-300 rounded px-2 py-1 text-sm mb-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-stone-800 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Submit
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-stone-500 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  );
}
