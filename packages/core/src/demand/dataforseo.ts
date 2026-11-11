// Optional paid provider. Only used when DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are set.
// Pricing (Nov 2026): SERP from $0.0006/page, Google Ads search volume ~$0.075 per 1k-keyword task.
import { fetchJson } from "../http.js";
import type { Lang, SerpResult } from "../types.js";

const BASE = "https://api.dataforseo.com/v3";

/** Google Ads location codes for the default country of each language (+ a few common ones). */
const LOCATION_CODES: Record<string, number> = {
  us: 2840, gb: 2826, ca: 2124, au: 2036, fr: 2250, be: 2056, ch: 2756, de: 2276, at: 2040, es: 2724, mx: 2484,
};

export function hasDataForSEO(): boolean {
  return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}

function auth(): Record<string, string> {
  const token = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

interface Envelope<T> {
  status_code: number;
  status_message: string;
  tasks?: { status_code: number; status_message: string; result?: T[] | null }[];
}

async function post<T>(path: string, body: unknown): Promise<T[]> {
  const data = await fetchJson<Envelope<T>>(`${BASE}${path}`, {
    method: "POST",
    headers: auth(),
    body,
    ttl: 7 * 86400, // paid calls: cache for a week
    timeoutMs: 60_000,
  });
  const task = data.tasks?.[0];
  if (data.status_code !== 20000 || !task || task.status_code !== 20000)
    throw new Error(`DataForSEO: ${task?.status_message ?? data.status_message}`);
  return task.result ?? [];
}

function location(country: string): number {
  const code = LOCATION_CODES[country.toLowerCase()];
  if (!code) throw new Error(`DataForSEO: no location code for country "${country}". Known: ${Object.keys(LOCATION_CODES).join(", ")}`);
  return code;
}

export async function searchVolumes(
  keywords: string[],
  lang: Lang,
  country: string,
): Promise<Record<string, number | null>> {
  const uniq = [...new Set(keywords.map((k) => k.toLowerCase().trim()))].filter(Boolean).slice(0, 1000);
  if (!uniq.length) return {};
  const rows = await post<{ keyword: string; search_volume: number | null }>(
    "/keywords_data/google_ads/search_volume/live",
    [{ keywords: uniq, language_code: lang, location_code: location(country) }],
  );
  const out: Record<string, number | null> = {};
  for (const r of rows) out[r.keyword] = r.search_volume;
  return out;
}

export async function serpTop(query: string, lang: Lang, country: string, depth = 10): Promise<SerpResult[]> {
  const rows = await post<{ items?: { type: string; rank_absolute: number; url: string; title: string; description?: string }[] }>(
    "/serp/google/organic/live/regular",
    [{ keyword: query, language_code: lang, location_code: location(country), depth }],
  );
  return (rows[0]?.items ?? [])
    .filter((i) => i.type === "organic")
    .map((i, idx) => ({ position: idx + 1, url: i.url, title: i.title, snippet: i.description }));
}
