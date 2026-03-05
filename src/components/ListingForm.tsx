'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LISTING_CATEGORIES, LISTING_CONDITIONS, MAX_DISTANCE_OPTIONS, CURRENCIES } from '@/lib/constants';

type Initial = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  currency: string;
  imageUrls: string[];
  locationLabel: string;
  maxDistanceKm: number | null;
  status?: string;
};

export function ListingForm({ initial }: { initial?: Initial }) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [condition, setCondition] = useState(initial?.condition ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'EUR');
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.imageUrls ?? []);
  const [locationLabel, setLocationLabel] = useState(initial?.locationLabel ?? '');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | ''>(
    initial?.maxDistanceKm != null ? initial.maxDistanceKm : ''
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || imageUrls.length >= 10) return;
    setUploading(true);
    const formData = new FormData();
    formData.set('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok && data.url) setImageUrls((prev) => [...prev, data.url]);
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      title,
      description,
      category,
      condition,
      price: parseFloat(price),
      currency,
      imageUrls,
      locationLabel: locationLabel || null,
      maxDistanceKm: maxDistanceKm === '' ? null : maxDistanceKm === -1 ? -1 : Number(maxDistanceKm),
    };
    const url = isEdit ? `/api/listings/${initial!.id}` : '/api/listings/create';
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEdit ? { ...payload, status: initial?.status } : payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.title?.[0] ?? data.error ?? 'Failed to save');
      return;
    }
    const data = await res.json();
    router.push(isEdit ? `/listings/${initial!.id}` : `/listings/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-1">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-md px-3 py-2"
          >
            <option value="">Select</option>
            {LISTING_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-stone-700 mb-1">Condition</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-md px-3 py-2"
          >
            <option value="">Select</option>
            {LISTING_CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-1">Price</label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-stone-700 mb-1">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Photos</label>
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url) => (
            <div key={url} className="relative w-20 h-20 rounded overflow-hidden bg-stone-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-bl"
              >
                ×
              </button>
            </div>
          ))}
          {imageUrls.length < 10 && (
            <label className="w-20 h-20 border-2 border-dashed border-stone-300 rounded flex items-center justify-center cursor-pointer text-stone-400 hover:border-primary-400">
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
              {uploading ? '…' : '+'}
            </label>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="locationLabel" className="block text-sm font-medium text-stone-700 mb-1">
          Your location (city, region or country)
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
          How far you&apos;re willing to deliver or meet (km)
        </label>
        <select
          id="maxDistanceKm"
          value={maxDistanceKm === '' ? '' : String(maxDistanceKm)}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') setMaxDistanceKm('');
            else if (v === '-1') setMaxDistanceKm(-1);
            else setMaxDistanceKm(parseInt(v, 10));
          }}
          className="w-full border border-stone-300 rounded-md px-3 py-2"
        >
          {MAX_DISTANCE_OPTIONS.map((o) => (
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
        {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create listing'}
      </button>
    </form>
  );
}
