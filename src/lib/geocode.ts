const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

export async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!query?.trim()) return null;
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '1',
  });
  const res = await fetch(`${NOMINATIM}?${params}`, {
    headers: { 'User-Agent': 'TTTrader/1.0' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}
