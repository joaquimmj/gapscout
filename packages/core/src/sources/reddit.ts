// Reddit WITHOUT the Reddit API (which closes to everyone in March 2027).
// Reddit threads are discovered the way a human finds them: through Google results.
//  - With DataForSEO credentials we run `site:reddit.com` queries through its Google SERP API.
//  - Without them, Reddit is skipped. Claude's own web search/fetch tools cannot access reddit.com
//    (verified Nov 2026: "domains not accessible to our user agent"); other hosts' search tools may.
//    We still return the queries as `hostSearchQueries` for hosts whose search can reach Reddit.
// We never scrape reddit.com directly and never bypass a restriction.
import { hasDataForSEO, serpTop } from "../demand/dataforseo.js";
import { LANG_PACKS } from "../i18n.js";
import type { Complaint, SearchOptions, SourceResult } from "../types.js";

export function redditSearchQueries(query: string, opts: { lang: SearchOptions["lang"]; subreddits?: string[] }): string[] {
  const subs = opts.subreddits?.length ? opts.subreddits : [];
  const base = subs.length
    ? subs.map((s) => `site:reddit.com/r/${s.replace(/^r\//, "")} ${query}`)
    : [`site:reddit.com ${query}`];
  return base;
}

export async function searchReddit(
  query: string,
  opts: SearchOptions & { subreddits?: string[]; country?: string },
): Promise<SourceResult & { hostSearchQueries?: string[] }> {
  const queries = redditSearchQueries(query, opts);
  if (!hasDataForSEO()) {
    return {
      source: "reddit",
      query,
      items: [],
      hostSearchQueries: queries,
      notes: [
        "Reddit skipped: no DataForSEO credentials. gapscout never uses the Reddit API. Claude's web tools cannot access reddit.com; if your host's web search can, you may run hostSearchQueries yourself. Otherwise rely on forums.",
        "Set DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD to include Reddit (via Google results, from $0.0006 per query).",
      ],
    };
  }
  const country = opts.country ?? LANG_PACKS[opts.lang].country;
  const items: Complaint[] = [];
  const notes: string[] = [];
  for (const q of queries) {
    try {
      const results = await serpTop(q, opts.lang, country, 20);
      for (const r of results) {
        if (!/reddit\.com\/r\/[^/]+\/comments\//.test(r.url)) continue;
        const sub = /reddit\.com\/r\/([^/]+)/.exec(r.url)?.[1];
        items.push({
          id: `rd:${r.url.replace(/^https?:\/\/(www\.|old\.)?reddit\.com/, "").split("?")[0]}`,
          source: "reddit",
          url: r.url,
          title: sub ? `[r/${sub}] ${r.title}` : r.title,
          text: r.snippet ?? "",
        });
      }
    } catch (e) {
      notes.push(`${q}: ${(e as Error).message}`);
    }
  }
  notes.push("Reddit items come from Google results (title + snippet). Claude cannot open reddit.com: quote only the snippet and mark it snippet_only.");
  return { source: "reddit", query, items: items.slice(0, opts.limit ?? 30), notes };
}
