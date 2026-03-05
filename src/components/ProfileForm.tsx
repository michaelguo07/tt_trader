'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string | null;
  name: string | null;
  bio: string | null;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  showApproximateOnly: boolean;
  isReseller: boolean;
};

export function ProfileForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [locationLabel, setLocationLabel] = useState(user.locationLabel ?? '');
  const [showApproximateOnly, setShowApproximateOnly] = useState(user.showApproximateOnly);
  const [isReseller, setIsReseller] = useState(user.isReseller);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || null,
        bio: bio || null,
        locationLabel: locationLabel || null,
        showApproximateOnly,
        isReseller,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to save');
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
        <p className="text-stone-600">{user.email}</p>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
          Display name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-stone-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-stone-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full border border-stone-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <label htmlFor="locationLabel" className="block text-sm font-medium text-stone-700 mb-1">
          Location (city, region or country)
        </label>
        <input
          id="locationLabel"
          type="text"
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
          placeholder="e.g. Berlin, Germany"
          className="w-full border border-stone-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="text-stone-500 text-xs mt-1">Used for &quot;Listings near you&quot; and distance filters</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="showApproximateOnly"
          type="checkbox"
          checked={showApproximateOnly}
          onChange={(e) => setShowApproximateOnly(e.target.checked)}
          className="rounded border-stone-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="showApproximateOnly" className="text-sm text-stone-700">
          Show approximate location only (e.g. city) to others
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="isReseller"
          type="checkbox"
          checked={isReseller}
          onChange={(e) => setIsReseller(e.target.checked)}
          className="rounded border-stone-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="isReseller" className="text-sm text-stone-700">
          I&apos;m a reseller
        </label>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 font-medium disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  );
}
