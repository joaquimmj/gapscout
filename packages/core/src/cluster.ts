// Naive, LLM-free theme extraction for the CLI. The Claude Code plugin uses the clusterer
// sub-agent instead; this exists so `npx gapscout scan` gives a useful raw view on its own.
import { LANG_PACKS } from "./i18n.js";
import type { Complaint, Lang } from "./types.js";

export interface Theme {
  phrase: string;
  items: Complaint[];
  sources: string[];
  avgPain: number;
}

/** Function words the per-language stopword lists miss; they make meaningless bigrams. */
const EXTRA_STOP = (
  "weil etwas dadurch dass allem dann gibt ohne große großen mehrheit immer wieder schon einfach leider bitte danke habe hatte hat wurde werden wird kann können muss müssen soll sollte geht alle alles dieses jeder jede nichts viel viele wirklich eigentlich also doch mal hier dort gerade selbst " +
  "depuis avant après encore toujours vraiment faut peut veut rien chaque trop moins quand alors donc parce puis cela celui celle leurs avoir sont était fois avez sais suis " +
  "desde antes después todavía siempre realmente hay puede quiere nada cada demasiado menos cuando entonces porque luego tiene tengo sido " +
  "yes love feedback high quality real thanks please would could should really just also still even want need make made using used thing things lot lots way ways able"
).split(" ");

/** Keep items that actually mention the niche (any term's 5-letter stem). App reviews are relevant by construction. */
export function relevantToNiche(c: Complaint, niche: string): boolean {
  if (c.source === "appstore") return true;
  const stems = niche
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .map((w) => w.slice(0, 5));
  if (!stems.length) return true;
  const text = `${c.title ?? ""} ${c.text}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return stems.some((s) => text.includes(s));
}

function tokens(text: string, stop: Set<string>): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\S+@\S+/g, " ")
    .replace(/[`*_>#\[\](){}"“”«».,;:!?/\\|=+<~^%$@&0-9-]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w) && !/^'/.test(w));
}

/**
 * Where an item lives (one app, one repo, one HN story). A theme must show up in at least two
 * containers, otherwise it's one app's name or one repo's jargon, not a recurring problem.
 */
function container(c: Complaint): string {
  if (c.source === "appstore") return c.id.split(":").slice(0, 3).join(":");
  if (c.source === "github") return c.id.split("#")[0]!;
  if (c.source === "stackexchange") return c.id; // each question is independent
  return c.title ? `${c.source}:${c.title}` : c.id;
}

/** Drop "[AppName · 1★]" / "[owner/repo]" prefixes the adapters add to titles. */
function cleanTitle(t?: string): string {
  return (t ?? "").replace(/^\[[^\]]*\]\s*/, "");
}

/** Count bigrams/trigrams by number of distinct complaints (not raw occurrences). */
export function extractThemes(items: Complaint[], lang: Lang, nicheTerms: string[], max = 12): Theme[] {
  const stop = new Set([
    ...LANG_PACKS[lang].stopwords,
    ...LANG_PACKS.en.stopwords,
    ...EXTRA_STOP,
    ...nicheTerms.map((t) => t.toLowerCase()),
  ]);
  const byGram = new Map<string, Set<number>>();
  items.forEach((c, idx) => {
    const toks = tokens(`${cleanTitle(c.title)} ${c.text}`, stop);
    const grams = new Set<string>();
    for (let n = 2; n <= 3; n++)
      for (let i = 0; i + n <= toks.length; i++) {
        const gram = toks.slice(i, i + n);
        // At least one real content word (5+ letters) in the phrase.
        if (gram.some((w) => w.length >= 5)) grams.add(gram.join(" "));
      }
    for (const g of grams) {
      if (!byGram.has(g)) byGram.set(g, new Set());
      byGram.get(g)!.add(idx);
    }
  });
  const ranked = [...byGram.entries()]
    .filter(([, s]) => s.size >= 2)
    .map(([g, s]) => ({ g, its: [...s].map((i) => items[i]!) }))
    .filter(({ its }) => new Set(its.map(container)).size >= 2)
    .map(({ g, its }) => {
      const avgPain = its.reduce((a, c) => a + (c.painHint ?? 0), 0) / its.length;
      const sources = [...new Set(its.map((c) => c.source))];
      return { phrase: g, items: its, sources, avgPain, weight: its.length * (1 + avgPain) * (1 + 0.3 * (sources.length - 1)) };
    })
    .sort((a, b) => b.weight - a.weight);

  // Greedy de-dup: skip a phrase if most of its complaints are already covered by a kept theme.
  const kept: Theme[] = [];
  for (const t of ranked) {
    if (kept.length >= max) break;
    const ids = new Set(t.items.map((i) => i.id));
    const overlaps = kept.some((k) => {
      const shared = k.items.filter((i) => ids.has(i.id)).length;
      return shared / ids.size > 0.6 || k.phrase.includes(t.phrase) || t.phrase.includes(k.phrase);
    });
    if (!overlaps) kept.push({ phrase: t.phrase, items: t.items, sources: t.sources, avgPain: t.avgPain });
  }
  return kept;
}
