'use client';

import { useState, useEffect } from 'react';

export function FavouriteButton({ listingId, initial }: { listingId: string; initial?: boolean }) {
  const [isFav, setIsFav] = useState(!!initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFav(!!initial);
  }, [initial]);

  async function toggle() {
    setLoading(true);
    const method = isFav ? 'DELETE' : 'POST';
    const res = await fetch(`/api/listings/${listingId}/favourite`, { method });
    setLoading(false);
    if (res.ok) setIsFav(!isFav);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="text-stone-500 hover:text-primary-500 disabled:opacity-50"
      title={isFav ? 'Remove from favourites' : 'Add to favourites'}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
    >
      {isFav ? '♥' : '♡'}
    </button>
  );
}
