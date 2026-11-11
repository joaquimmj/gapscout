// Apple App Store: public iTunes Search API + public customer-review RSS feed (JSON). No key.
// We keep only 1–3 star reviews: that's where the unmet needs are.
import { fetchJson } from "../http.js";
import { LANG_PACKS } from "../i18n.js";
import type { Complaint, SearchOptions, SourceResult } from "../types.js";

interface App {
  trackId: number;
  trackName: string;
  trackViewUrl: string;
  userRatingCount?: number;
  averageUserRating?: number;
}

interface Label {
  label: string;
}
interface Entry {
  id?: Label;
  author?: { name?: Label };
  "im:rating"?: Label;
  title?: Label;
  content?: Label;
  updated?: Label;
  "im:voteSum"?: Label;
}

export async function searchAppStore(
  query: string,
  opts: SearchOptions & { country?: string; apps?: number; maxRating?: number },
): Promise<SourceResult> {
  const country = (opts.country ?? LANG_PACKS[opts.lang].country).toLowerCase();
  const maxRating = opts.maxRating ?? 3;
  const appsWanted = opts.apps ?? 5;
  const search = await fetchJson<{ results: App[] }>(
    `https://itunes.apple.com/search?${new URLSearchParams({
      term: query,
      entity: "software",
      country,
      limit: String(appsWanted),
    })}`,
  );
  const items: Complaint[] = [];
  const notes: string[] = [];
  const since = opts.sinceDays ? Date.now() - opts.sinceDays * 86400_000 : 0;
  for (const app of search.results) {
    try {
      const feed = await fetchJson<{ feed?: { entry?: Entry[] | Entry } }>(
        `https://itunes.apple.com/${country}/rss/customerreviews/page=1/id=${app.trackId}/sortby=mostrecent/json`,
      );
      const raw = feed.feed?.entry;
      const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
      let kept = 0;
      for (const e of entries) {
        const rating = Number(e["im:rating"]?.label);
        if (!rating || rating > maxRating) continue;
        const updated = e.updated?.label;
        if (since && updated && Date.parse(updated) < since) continue;
        kept++;
        items.push({
          id: `as:${country}:${app.trackId}:${e.id?.label ?? kept}`,
          source: "appstore",
          url: app.trackViewUrl,
          title: `[${app.trackName} · ${rating}★] ${e.title?.label ?? ""}`.trim(),
          text: e.content?.label ?? "",
          author: e.author?.name?.label,
          createdAt: updated,
          rating,
          engagement: Number(e["im:voteSum"]?.label) || undefined,
        });
      }
      notes.push(`${app.trackName}: ${kept} reviews ≤${maxRating}★ of ${entries.length} recent (avg ${app.averageUserRating?.toFixed(1) ?? "?"}★, ${app.userRatingCount ?? "?"} ratings)`);
    } catch (e) {
      notes.push(`${app.trackName}: ${(e as Error).message}`);
    }
  }
  if (!search.results.length) notes.push(`No App Store apps found for "${query}" in ${country.toUpperCase()}.`);
  return { source: "appstore", query, items: items.slice(0, opts.limit ?? 60), notes };
}
