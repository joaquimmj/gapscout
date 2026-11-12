// High-level operations shared by the MCP server and the CLI.
import { expandSeed } from "./demand/autocomplete.js";
import { hasDataForSEO, searchVolumes, serpTop } from "./demand/dataforseo.js";
import { LANG_PACKS, painHint } from "./i18n.js";
import { demandScore, serpWeakness } from "./scoring.js";
import { searchAppStore } from "./sources/appstore.js";
import { getBlueskyThread, searchBluesky } from "./sources/bluesky.js";
import { getDiscourseThread, searchDiscourse } from "./sources/discourse.js";
import { getGitHubThread, searchGitHub } from "./sources/github.js";
import { getHNThread, searchHN } from "./sources/hn.js";
import { searchReddit } from "./sources/reddit.js";
import { getStackExchangeThread, searchStackExchange } from "./sources/stackexchange.js";
import type { Complaint, KeywordDemand, Lang, SerpResult, SerpSnapshot, SourceId, SourceResult, Thread } from "./types.js";

export interface SearchComplaintsInput {
  query: string;
  lang: Lang;
  sources?: SourceId[];
  sinceDays?: number;
  limit?: number;
  country?: string;
  seSites?: string[];
  subreddits?: string[];
  /** Discourse forum domains to search (e.g. ["forum.code.org"]). */
  discourseDomains?: string[];
  /** Drop items with no pain signal at all. Default false: the LLM reads better than a lexicon. */
  painOnly?: boolean;
}

export interface SearchComplaintsOutput {
  query: string;
  lang: Lang;
  results: (SourceResult & { hostSearchQueries?: string[] })[];
}

export async function searchComplaints(input: SearchComplaintsInput): Promise<SearchComplaintsOutput> {
  const defaults: SourceId[] = ["hn", "stackexchange", "github", "appstore", "bluesky", "reddit"];
  if (input.discourseDomains?.length) defaults.push("discourse");
  const sources = input.sources?.length ? input.sources : defaults;
  const opts = { lang: input.lang, sinceDays: input.sinceDays, limit: input.limit ?? 15 };
  const runners: Record<SourceId, () => Promise<SourceResult & { hostSearchQueries?: string[] }>> = {
    hn: () => searchHN(input.query, opts),
    stackexchange: () => searchStackExchange(input.query, { ...opts, sites: input.seSites }),
    github: () => searchGitHub(input.query, opts),
    appstore: () => searchAppStore(input.query, { ...opts, country: input.country }),
    bluesky: () => searchBluesky(input.query, opts),
    discourse: () => searchDiscourse(input.query, { ...opts, domains: input.discourseDomains ?? [] }),
    reddit: () => searchReddit(input.query, { ...opts, subreddits: input.subreddits, country: input.country }),
  };
  const settled = await Promise.allSettled(sources.map((s) => runners[s]()));
  const results = settled.map((r, i) => {
    const source = sources[i]!;
    if (r.status === "rejected")
      return { source, query: input.query, items: [], notes: [`error: ${(r.reason as Error)?.message ?? r.reason}`] };
    const res = r.value;
    for (const item of res.items) {
      const ph = painHint(`${item.title ?? ""}\n${item.text}`, input.lang);
      item.painHint = ph.score;
      item.painTerms = ph.terms;
    }
    let items = res.items;
    if (input.painOnly) items = items.filter((x) => (x.painHint ?? 0) > 0 || (x.rating ?? 5) <= 2);
    items.sort((a, b) => rank(b) - rank(a));
    return { ...res, items };
  });
  return { query: input.query, lang: input.lang, results };
}

function rank(c: Complaint): number {
  const eng = Math.log10(1 + Math.max(0, c.engagement ?? 0) + (c.comments ?? 0));
  const ratingPain = c.rating ? (4 - c.rating) / 3 : 0;
  return (c.painHint ?? 0) * 2 + ratingPain + eng * 0.5;
}

/** id is the Complaint id returned by search_complaints, e.g. "hn:123", "se:superuser:42", "gh:o/r#7". */
export async function getThread(id: string): Promise<Thread> {
  const [prefix, ...rest] = id.split(":");
  const tail = rest.join(":");
  switch (prefix) {
    case "hn":
      return getHNThread(tail);
    case "se":
      return getStackExchangeThread(tail);
    case "gh":
      return getGitHubThread(tail);
    case "bs":
      return getBlueskyThread(tail);
    case "dc":
      return getDiscourseThread(tail);
    case "rd":
      throw new Error("Reddit threads are read with your web fetch tool (open the thread URL), not through gapscout.");
    case "as":
      throw new Error("App Store reviews are standalone; there is no thread to fetch.");
    default:
      throw new Error(`Unknown id prefix "${prefix}". Expected hn:, se:, gh:, bs:, dc:.`);
  }
}

export async function keywordDemand(input: {
  seed: string;
  lang: Lang;
  country?: string;
  depth?: "quick" | "normal" | "deep";
  /** Keep only suggestions containing one of these words (e.g. the problem's key terms). */
  mustInclude?: string[];
  withVolumes?: boolean;
}): Promise<KeywordDemand> {
  const country = (input.country ?? LANG_PACKS[input.lang].country).toLowerCase();
  const notes: string[] = [];
  let suggestions = await expandSeed(input.seed, input.lang, country, input.depth ?? "normal");
  // Job-seeker searches ("comptable freelance offre", "… salaire", "… maroc") are not demand for a product.
  const before = suggestions.length;
  // English job words show up in every language; the target language adds its own.
  const jobNoise = [LANG_PACKS.en.jobNoise, LANG_PACKS[input.lang].jobNoise];
  suggestions = suggestions.filter((s) => !jobNoise.some((re) => re.test(s.keyword)));
  if (suggestions.length < before) notes.push(`${before - suggestions.length} job-search suggestion(s) ignored (offre, emploi, salaire, hiring…)`);
  if (input.mustInclude?.length) {
    const needles = input.mustInclude.map((w) => w.toLowerCase());
    suggestions = suggestions.filter((s) => needles.some((n) => s.keyword.includes(n)));
  }
  let volumes: Record<string, number | null> | undefined;
  if ((input.withVolumes ?? true) && hasDataForSEO() && suggestions.length) {
    try {
      volumes = await searchVolumes(suggestions.map((s) => s.keyword), input.lang, country);
    } catch (e) {
      notes.push(`volumes unavailable: ${(e as Error).message}`);
    }
  } else if (!hasDataForSEO()) {
    notes.push("Free mode: Google Autocomplete only (no volumes). Set DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD for monthly volumes.");
  }
  if (volumes) suggestions.sort((a, b) => (volumes![b.keyword] ?? -1) - (volumes![a.keyword] ?? -1));
  return {
    seed: input.seed,
    lang: input.lang,
    country,
    suggestions,
    volumes,
    demandScore: demandScore(suggestions, volumes),
    notes,
  };
}

export async function serpSnapshot(input: {
  query: string;
  lang: Lang;
  country?: string;
  /** Results gathered by the host agent's own web search, when DataForSEO isn't configured. */
  results?: SerpResult[];
}): Promise<SerpSnapshot> {
  const country = (input.country ?? LANG_PACKS[input.lang].country).toLowerCase();
  const notes: string[] = [];
  let results = input.results ?? [];
  if (!results.length && hasDataForSEO()) {
    results = await serpTop(input.query, input.lang, country, 10);
    notes.push("SERP from DataForSEO (Google organic, top 10).");
  } else if (!results.length) {
    notes.push(
      "No SERP data. Run this query with your web search tool, then call serp_snapshot again with `results` = [{position, url, title}] for the top 10.",
    );
  } else {
    notes.push("SERP supplied by the host agent's web search (may differ slightly from Google).");
  }
  const { score, signals } = serpWeakness(input.query, results);
  return { query: input.query, results, weakness: score, signals, notes };
}
