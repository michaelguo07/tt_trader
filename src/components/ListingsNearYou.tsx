'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  locationLabel: string | null;
  imageUrls: string[];
  _distanceKm?: number | null;
};

export function ListingsNearYou() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      // Try profile first (logged-in user's saved location)
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile.latitude != null && profile.longitude != null) {
          if (!cancelled) setCoords({ lat: profile.latitude, lng: profile.longitude });
          return;
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    const params = new URLSearchParams({
      lat: String(coords.lat),
      lng: String(coords.lng),
      withinKm: '50',
      sort: 'distance',
      limit: '6',
    });
    fetch(`/api/listings?${params}`)
      .then((res) => res.json())
      .then((data) => setListings(data.listings ?? []))
      .catch(() => setError('Could not load listings'))
      .finally(() => setLoading(false));
  }, [coords]);

  const useBrowserLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setError('Location denied or unavailable');
        setLoading(false);
      }
    );
  };

  if (loading && !coords) return null;
  if (!coords) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">Listings near you</h2>
        <p className="text-stone-600 mb-2">
          Set your location in your <Link href="/profile" className="text-primary-600 hover:underline">profile</Link> or
          use your browser&apos;s location to see listings within 50 km.
        </p>
        <button
          type="button"
          onClick={useBrowserLocation}
          className="text-primary-600 hover:underline font-medium"
        >
          Use my location
        </button>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">Listings near you</h2>
        <p className="text-stone-600">{error}</p>
        <button type="button" onClick={useBrowserLocation} className="mt-2 text-primary-600 hover:underline">
          Try again
        </button>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">Listings near you</h2>
        <p className="text-stone-500">Loading...</p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-4">Listings near you</h2>
      {listings.length === 0 ? (
        <p className="text-stone-600">No listings within 50 km. Try a larger radius on the Listings page.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {l._distanceKm != null && (
                  <p className="text-stone-500 text-sm">~{Math.round(l._distanceKm)} km away</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Link href="/listings" className="text-primary-600 hover:underline font-medium">
          Browse all listings →
        </Link>
      </div>
    </section>
  );
}
