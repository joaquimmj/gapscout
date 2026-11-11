export type Lang = "en" | "fr" | "de" | "es";
export const LANGS: readonly Lang[] = ["en", "fr", "de", "es"] as const;

export type SourceId = "hn" | "stackexchange" | "github" | "appstore" | "bluesky" | "discourse" | "reddit";
export const SOURCE_IDS: readonly SourceId[] = ["hn", "stackexchange", "github", "appstore", "bluesky", "discourse", "reddit"] as const;

/** One piece of evidence: a post, comment, issue or review where someone describes a problem. */
export interface Complaint {
  /** Stable id, prefixed by source: "hn:123", "se:stackoverflow:456", "gh:owner/repo#7", "as:fr:123:456". */
  id: string;
  source: SourceId;
  url: string;
  title?: string;
  text: string;
  author?: string;
  /** ISO date. */
  createdAt?: string;
  /** Source-native engagement: points, votes, reactions, rating… */
  engagement?: number;
  comments?: number;
  /** For app reviews: 1–5 stars. */
  rating?: number;
  /** Rough pain signal from the multilingual lexicon (0–1). The LLM makes the real call. */
  painHint?: number;
  /** Which lexicon terms matched, to make painHint explainable. */
  painTerms?: string[];
}

export interface SearchOptions {
  lang: Lang;
  /** Only return items newer than this many days. */
  sinceDays?: number;
  limit?: number;
}

export interface SourceResult {
  source: SourceId;
  query: string;
  items: Complaint[];
  /** Human/agent-readable notes: quota left, skipped because no key, "use host web search"… */
  notes: string[];
}

export interface Thread {
  id: string;
  source: SourceId;
  url: string;
  title?: string;
  text: string;
  replies: { author?: string; text: string; engagement?: number; createdAt?: string }[];
}

export interface Suggestion {
  keyword: string;
  /** Which seed/modifier produced it. */
  from: string;
}

export interface KeywordDemand {
  seed: string;
  lang: Lang;
  country: string;
  suggestions: Suggestion[];
  /** Monthly search volumes, only when DataForSEO credentials are set. */
  volumes?: Record<string, number | null>;
  demandScore: Score;
  notes: string[];
}

export interface SerpResult {
  position: number;
  url: string;
  title: string;
  snippet?: string;
}

/** A factor scored 1–5 with the reason shown to the user. */
export interface Score {
  value: 1 | 2 | 3 | 4 | 5;
  why: string;
}

export interface SerpSnapshot {
  query: string;
  results: SerpResult[];
  weakness: Score;
  signals: string[];
  notes: string[];
}

export interface Opportunity {
  title: string;
  problem: string;
  /** Who has the problem. */
  audience?: string;
  /** verified: "api" (copied from an API), "exact"/"close" (checked on the live page), "snippet" (search snippet only). */
  evidence: { quote: string; url: string; source: SourceId | string; verified?: "api" | "exact" | "close" | "manual" | "snippet" }[];
  frequency: Score;
  intensity: Score;
  demand: Score;
  serpWeakness: Score;
  keywords: { keyword: string; volume?: number | null }[];
  productIdea: string;
  /** What existing solutions miss — the wedge. */
  gap?: string;
  competitors?: string[];
  /** Skeptic's verdict. */
  risks?: string[];
  score?: number;
}

export interface Report {
  niche: string;
  lang: Lang;
  generatedAt: string;
  sourcesUsed: string[];
  opportunities: Opportunity[];
  discarded?: { title: string; reason: string }[];
  /** Run-wide caveats: sources skipped, free mode, thin coverage. */
  notes?: string[];
}
