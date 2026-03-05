'use client';

import { useState } from 'react';

export function LeaveReviewForm({ revieweeId, revieweeName }: { revieweeId: string; revieweeName: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revieweeId, rating, comment: comment || undefined }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to submit');
      return;
    }
    setSubmitted(true);
  }

  if (submitted) return <p className="text-green-600 mt-4">Thanks for your review!</p>;

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border border-stone-200 rounded-lg">
      <h3 className="font-medium mb-2">Leave a review for {revieweeName}</h3>
      <div className="flex gap-2 items-center mb-2">
        <label className="text-sm">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border border-stone-300 rounded px-2 py-1"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} ★</option>
          ))}
        </select>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comment (optional)"
        rows={2}
        className="w-full border border-stone-300 rounded px-3 py-2 text-sm mb-2"
      />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button type="submit" className="bg-primary-500 text-white px-3 py-1.5 rounded text-sm hover:bg-primary-600">
        Submit review
      </button>
    </form>
  );
}
