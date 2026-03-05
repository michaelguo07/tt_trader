'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LISTING_CATEGORIES, LISTING_CONDITIONS, MAX_DISTANCE_OPTIONS } from '@/lib/constants';

async function saveSearch(params: {
  query?: string;
  category?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  maxDistanceKm?: string;
  lat?: number;
  lng?: number;
}) {
  const res = await fetch('/api/saved-searches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: params.query || null,
      category: params.category || null,
      condition: params.condition || null,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : null,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : null,
      maxDistanceKm: params.maxDistanceKm ? parseFloat(params.maxDistanceKm) : null,
      latitude: params.lat ?? null,
      longitude: params.lng ?? null,
    }),
  });
  if (!res.ok) throw new Error('Failed to save');
}

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  currency: string;
  locationLabel: string | null;
  maxDistanceKm: number | null;
  imageUrls: string[];
  seller: { id: string; name: string | null; locationLabel: string | null };
  _distanceKm?: number | null;
};

export function ListingsClient({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');
  const [withinKm, setWithinKm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [saveSearchStatus, setSaveSearchStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (q) params.set('q', q);
    params.set('sort', sort);
    params.set('page', String(page));
    if (withinKm) params.set('withinKm', withinKm);
    if (userLocation) {
      params.set('lat', String(userLocation.lat));
      params.set('lng', String(userLocation.lng));
    }
    setLoading(true);
    fetch(`/api/listings?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [category, condition, minPrice, maxPrice, q, sort, page, withinKm, userLocation]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null)
    );
  };

  const handleSaveSearch = async () => {
    setSaveSearchStatus('saving');
    try {
      await saveSearch({
        query: q || undefined,
        category: category || undefined,
        condition: condition || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        maxDistanceKm: withinKm || undefined,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
      });
      setSaveSearchStatus('saved');
    } catch {
      setSaveSearchStatus('error');
    }
    setTimeout(() => setSaveSearchStatus('idle'), 2000);
  };

  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Search</label>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title or description..."
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
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="border border-stone-300 rounded-md px-3 py-2"
          >
            <option value="">All</option>
            {LISTING_CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Price range</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="border border-stone-300 rounded-md px-2 py-2 w-20"
            />
            <span className="self-center">–</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="border border-stone-300 rounded-md px-2 py-2 w-20"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Within (km)</label>
          <select
            value={withinKm}
            onChange={(e) => setWithinKm(e.target.value)}
            className="border border-stone-300 rounded-md px-3 py-2"
          >
            <option value="">Any</option>
            {MAX_DISTANCE_OPTIONS.filter((o) => o.value > 0).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          className="text-sm text-primary-600 hover:underline"
        >
          Use my location
        </button>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-stone-300 rounded-md px-3 py-2"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price (low)</option>
            <option value="price_desc">Price (high)</option>
            <option value="distance">Distance</option>
          </select>
        </div>
        {isLoggedIn && (
          <button
            type="button"
            onClick={handleSaveSearch}
            disabled={saveSearchStatus === 'saving'}
            className="text-sm text-primary-600 hover:underline disabled:opacity-50"
          >
            {saveSearchStatus === 'saved' ? 'Saved!' : saveSearchStatus === 'error' ? 'Failed' : saveSearchStatus === 'saving' ? 'Saving...' : 'Save this search'}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-stone-500">Loading...</p>
      ) : (
        <>
          <p className="text-stone-600">{total} listing{total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="block border border-stone-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition"
              >
                <div className="aspect-[4/3] bg-stone-100 flex items-center justify-center">
                  {l.imageUrls[0] ? (
                    <img src={l.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-stone-400 text-sm">No image</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{l.title}</h3>
                  <p className="text-primary-600 font-semibold">
                    {l.currency} {l.price.toFixed(2)}
                  </p>
                  <p className="text-stone-500 text-sm">{l.locationLabel ?? l.seller.locationLabel ?? '—'}</p>
                  {l._distanceKm != null && (
                    <p className="text-stone-500 text-xs">~{Math.round(l._distanceKm)} km away</p>
                  )}
                </div>
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
              <span className="px-3 py-1">
                Page {page} of {totalPages}
              </span>
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
