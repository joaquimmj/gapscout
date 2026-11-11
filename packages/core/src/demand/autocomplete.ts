// Google Autocomplete as a free demand signal: if Google suggests a phrase, enough people type it.
// No volumes here — those come from DataForSEO when configured.
import { fetchJson } from "../http.js";
import { LANG_PACKS } from "../i18n.js";
import type { Lang, Suggestion } from "../types.js";

const ENDPOINT = "https://suggestqueries.google.com/complete/search";

export async function suggest(q: string, lang: Lang, country: string): Promise<string[]> {
  const params = new URLSearchParams({ client: "firefox", q, hl: lang, gl: country });
  // Response shape: [query, [suggestions...], ...]
  const data = await fetchJson<[string, string[]]>(`${ENDPOINT}?${params}`, { ttl: 3 * 86400 });
  return Array.isArray(data?.[1]) ? data[1] : [];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Expand a seed with problem-shaped modifiers (questions, "alternative", "not working"…).
 * depth "quick" ≈ 8 calls, "normal" ≈ 16, "deep" adds a–z (≈ 42).
 */
export async function expandSeed(
  seed: string,
  lang: Lang,
  country: string,
  depth: "quick" | "normal" | "deep" = "normal",
): Promise<Suggestion[]> {
  const pack = LANG_PACKS[lang];
  const prefixes = depth === "quick" ? pack.questionPrefixes.slice(0, 2) : pack.questionPrefixes;
  const suffixes = depth === "quick" ? pack.problemSuffixes.slice(0, 5) : pack.problemSuffixes;
  const probes: string[] = [seed, ...prefixes.map((p) => `${p} ${seed}`), ...suffixes.map((s) => `${seed} ${s}`)];
  if (depth === "deep") for (const c of "abcdefghijklmnopqrstuvwxyz") probes.push(`${seed} ${c}`);

  const seen = new Map<string, Suggestion>();
  let failures = 0;
  let lastError: unknown;
  for (const probe of probes) {
    try {
      for (const kw of await suggest(probe, lang, country)) {
        const k = kw.toLowerCase().trim();
        if (!seen.has(k)) seen.set(k, { keyword: k, from: probe });
      }
    } catch (e) {
      // Autocomplete is best-effort; one failed probe shouldn't sink the scan.
      failures++;
      lastError = e;
    }
    await sleep(120); // be polite
  }
  // Every probe failed: that's an outage, not "no demand" — don't let it score 1/5 silently.
  if (failures === probes.length) throw new Error(`Google Autocomplete unavailable: ${(lastError as Error)?.message ?? lastError}`);
  return [...seen.values()];
}
