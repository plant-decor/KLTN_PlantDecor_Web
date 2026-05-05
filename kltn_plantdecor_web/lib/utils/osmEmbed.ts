const EMBED_BASE = 'https://www.openstreetmap.org/export/embed.html';

const DEFAULT_BBOX_PAD = 0.02;

/**
 * URL nhúng OSM: bbox theo thứ tự min lon, min lat, max lon, max lat; marker: lat,lon
 */
export function buildOsmEmbedUrl(params: {
  lat: number;
  lon: number;
  paddingDegrees?: number;
}): string {
  const d = params.paddingDegrees ?? DEFAULT_BBOX_PAD;
  const { lat, lon } = params;
  const minLat = lat - d;
  const maxLat = lat + d;
  const minLon = lon - d;
  const maxLon = lon + d;
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
  const marker = `${lat},${lon}`;

  const query = new URLSearchParams();
  query.set('bbox', bbox);
  query.set('layer', 'mapnik');
  query.set('marker', marker);
  return `${EMBED_BASE}?${query.toString()}`;
}

/** Tìm kiếm theo chuỗi địa chỉ, không cần tọa độ. */
export function buildOsmSearchUrl(addressOrQuery: string): string {
  if (!addressOrQuery || !addressOrQuery.trim()) {
    return 'https://www.openstreetmap.org/';
  }
  const q = new URLSearchParams();
  q.set('query', addressOrQuery.trim());
  return `https://www.openstreetmap.org/search?${q.toString()}`;
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
