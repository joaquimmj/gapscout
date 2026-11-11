// Opportunity score = frequency × intensity × Google demand × SERP weakness, each 1–5 with a visible reason.
import type { Score, SerpResult, Suggestion } from "./types.js";

const clamp = (n: number): Score["value"] => Math.max(1, Math.min(5, Math.round(n))) as Score["value"];

export function frequencyScore(mentions: number, distinctSources: number): Score {
  const base = mentions >= 21 ? 5 : mentions >= 11 ? 4 : mentions >= 6 ? 3 : mentions >= 3 ? 2 : 1;
  const bonus = distinctSources >= 3 && base < 5 ? 1 : 0;
  return {
    value: clamp(base + bonus),
    why: `${mentions} independent mention${mentions === 1 ? "" : "s"} across ${distinctSources} source${distinctSources === 1 ? "" : "s"}${bonus ? " (+1: seen on 3+ sources)" : ""}`,
  };
}

/** A starting point for the LLM, from lexicon hits. The clusterer overrides it after reading. */
export function intensityHint(painHints: number[], wtpMentions: number): Score {
  const avg = painHints.length ? painHints.reduce((a, b) => a + b, 0) / painHints.length : 0;
  const v = 1 + avg * 3 + Math.min(wtpMentions, 2) * 0.5;
  return { value: clamp(v), why: `avg pain signal ${avg.toFixed(2)}, ${wtpMentions} willingness-to-pay phrase(s)` };
}

/**
 * Demand from Google. With volumes (DataForSEO): monthly searches summed over relevant keywords.
 * Without: how many relevant autocomplete suggestions exist — a proxy, labelled as such.
 */
export function demandScore(relevant: Suggestion[] | string[], volumes?: Record<string, number | null>): Score {
  const kws = relevant.map((s) => (typeof s === "string" ? s : s.keyword).toLowerCase());
  if (volumes && Object.keys(volumes).length) {
    const total = kws.reduce((sum, k) => sum + (volumes[k] ?? 0), 0);
    const v = total >= 5000 ? 5 : total >= 1000 ? 4 : total >= 200 ? 3 : total >= 50 ? 2 : 1;
    return { value: v, why: `${total.toLocaleString("en-US")} searches/month across ${kws.length} keyword(s) (Google Ads data)` };
  }
  const n = kws.length;
  const v = n >= 25 ? 5 : n >= 10 ? 4 : n >= 4 ? 3 : n >= 1 ? 2 : 1;
  return {
    value: v,
    why: `${n} related Google Autocomplete suggestion(s) — proxy for demand, no volumes (set DataForSEO keys for volumes)`,
  };
}

const UGC = [
  /(^|\.)reddit\.com$/, /(^|\.)quora\.com$/, /(^|\.)stackexchange\.com$/, /(^|\.)stackoverflow\.com$/,
  /(^|\.)superuser\.com$/, /(^|\.)news\.ycombinator\.com$/, /(^|\.)medium\.com$/, /(^|\.)facebook\.com$/,
  /(^|\.)linkedin\.com$/, /(^|\.)youtube\.com$/, /(^|\.)tiktok\.com$/, /(^|\.)twitter\.com$/, /(^|\.)x\.com$/,
  /(^|\.)github\.com$/, /(^|\.)answers\./, /(^|\.)community\./, /(^|\.)forum\./, /^forum[a-z0-9-]*\./, /(^|\.)discourse\./,
  /(^|\.)bsky\.app$/,
  /(^|\.)commentcamarche\.net$/, /(^|\.)doctissimo\.fr$/, /(^|\.)gutefrage\.net$/, /(^|\.)forocoches\.com$/,
  // Public complaint / review pages: users describing the problem, not a solution.
  /(^|\.)plus\.transformation\.gouv\.fr$/, /(^|\.)trustpilot\.com$/, /(^|\.)avis-verifies\.com$/,
  /(^|\.)indiehackers\.com$/, /(^|\.)gutefrage\.net$/, /(^|\.)finanzfrage\.net$/,
];
/** Thin results: app-store listings and template galleries rank, but no dedicated page answers the query. */
const THIN = [
  /(^|\.)apps\.apple\.com$/, /(^|\.)play\.google\.com$/, /(^|\.)alternativeto\.net$/, /(^|\.)jotform\.com$/,
  /(^|\.)canva\.com$/, /(^|\.)template\.net$/,
  // Software directories: they rank everywhere but are lists, not answers.
  /(^|\.)capterra\./, /(^|\.)getapp\./, /(^|\.)g2\.com$/, /(^|\.)softwareadvice\./, /(^|\.)trusted\.de$/, /(^|\.)omr\.com$/,
];
/** Comparison / listicle pages: affiliate content, no dedicated solution. A mild weakness signal. */
const LISTICLE = /\b(meilleur|meilleurs|comparatif|top \d+|best|vs\.?|alternatives?|vergleich|besten|mejores|comparativa)\b/i;
const AUTHORITY = [
  /(^|\.)wikipedia\.org$/, /\.gov(\.[a-z]{2})?$/, /\.gouv\.fr$/, /(^|\.)service-public\.fr$/, /\.bund\.de$/,
  /\.gob\.es$/, /(^|\.)google\.com$/, /(^|\.)microsoft\.com$/, /(^|\.)apple\.com$/, /(^|\.)amazon\./,
];

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * How beatable is page 1? Forums, Q&A and thin results in the top spots mean nobody has built a
 * good dedicated answer yet. Authority sites mean it's hard to rank.
 */
export function serpWeakness(query: string, results: SerpResult[]): { score: Score; signals: string[] } {
  const top = results.slice(0, 10);
  if (!top.length) return { score: { value: 3, why: "no SERP data — neutral score" }, signals: [] };
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const signals: string[] = [];
  let points = 0;
  top.forEach((r, i) => {
    const h = host(r.url);
    if (UGC.some((re) => re.test(h))) {
      const w = i < 3 ? 2 : 1;
      points += w;
      signals.push(`#${r.position} is user-generated content (${h})${i < 3 ? " in the top 3" : ""}`);
    } else if (AUTHORITY.some((re) => re.test(h))) {
      points -= 1;
      signals.push(`#${r.position} is a high-authority site (${h})`);
    } else if (THIN.some((re) => re.test(h))) {
      points += 0.5;
      signals.push(`#${r.position} is an app-store listing or template gallery (${h}), not a dedicated page`);
    } else if (LISTICLE.test(r.title)) {
      points += 0.5;
      signals.push(`#${r.position} is a comparison/listicle page, not a dedicated solution ("${r.title.slice(0, 50)}")`);
    }
    if (terms.length && i < 5) {
      const title = r.title.toLowerCase();
      const matched = terms.filter((t) => title.includes(t)).length;
      if (matched / terms.length < 0.5) {
        points += 0.5;
        signals.push(`#${r.position} title barely matches the query ("${r.title.slice(0, 60)}")`);
      }
    }
  });
  const v = points >= 6 ? 5 : points >= 4 ? 4 : points >= 2 ? 3 : points >= 1 ? 2 : 1;
  const ugcCount = signals.filter((s) => s.includes("user-generated")).length;
  return {
    score: { value: v, why: `${ugcCount}/${top.length} results are forums/Q&A; weakness points ${points}` },
    signals,
  };
}

/**
 * The score is the product of the four factors (1–625), so one weak factor sinks an idea.
 * For display it is mapped to 0–100 through the geometric mean: all factors at 1 → 0,
 * all at 3 → 50, all at 5 → 100. Same ranking as the product, but readable.
 */
export function opportunityScore(f: Score, i: Score, d: Score, s: Score): { product: number; outOf100: number } {
  const product = f.value * i.value * d.value * s.value;
  const geo = Math.pow(product, 1 / 4);
  return { product, outOf100: Math.round(((geo - 1) / 4) * 100) };
}
