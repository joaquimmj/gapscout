// gapscout CLI — the agent-free door. `npx gapscout scan "freelance accounting" --lang en`
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import {
  complaintQueries,
  extractThemes,
  fetchPage,
  getCache,
  getThread,
  verifyQuote,
  hasDataForSEO,
  isLang,
  keywordDemand,
  relevantToNiche,
  renderReport,
  withScores,
  searchComplaints,
  serpSnapshot,
  SOURCE_IDS,
  truncate,
  type Complaint,
  type Lang,
  type Report,
  type SourceId,
} from "../../core/src/index.js";

const HELP = `gapscout — find problems worth building, proven by real complaints and real Google demand.

Usage
  gapscout scan "<niche>" [--lang en|fr|de|es] [--sources hn,stackexchange,github,appstore]
                          [--since <days>] [--limit <n>] [--themes <n>] [--no-demand] [--out <dir>] [--json]
  gapscout search "<query>" [--lang fr] [--sources hn,reddit,…] [--since <days>] [--limit <n>]
                            [--se-sites money,freelancing] [--discourse-domains forum.x.com] [--country fr]   (JSON)
  gapscout demand "<keyword>" [--lang fr] [--country fr] [--depth quick|normal|deep]
  gapscout serp "<query>" [--lang fr] [--results top10.json]
                               (scores results you pass; fetches them itself with DATAFORSEO_*)
  gapscout thread <id>                         (hn:123 · se:superuser:456 · gh:owner/repo#7)
  gapscout fetch <url>                         (raw page text, robots.txt respected)
  gapscout verify <url> "<quote>"              (is the quote really on the page?)
  gapscout cache [clear]                       (where the local cache lives, its size; clear it)
  gapscout render <report.json> [--json]       (JSON report → Markdown, or scored JSON)

search / demand --json / serp / thread print the same JSON as the MCP tools of the same name.

The CLI does a raw, LLM-free scan (n-gram themes). For clustered, skeptic-checked reports
with product ideas, use the Claude Code plugin: /gapscout "<niche>" --lang fr

Env (all optional): GITHUB_TOKEN, STACKEXCHANGE_KEY, DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD,
GAPSCOUT_CACHE_DIR, GAPSCOUT_NO_CACHE=1`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    lang: { type: "string", default: "en" },
    country: { type: "string" },
    sources: { type: "string" },
    since: { type: "string" },
    limit: { type: "string" },
    themes: { type: "string", default: "8" },
    depth: { type: "string", default: "quick" },
    "no-demand": { type: "boolean", default: false },
    out: { type: "string" },
    results: { type: "string" },
    "se-sites": { type: "string" },
    subreddits: { type: "string" },
    "discourse-domains": { type: "string" },
    json: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

const [cmd, ...rest] = positionals;
const arg = rest.join(" ").trim();

function die(msg: string): never {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

function langOpt(): Lang {
  const l = values.lang!.toLowerCase();
  if (!isLang(l)) die(`--lang must be one of en, fr, de, es (got "${l}")`);
  return l;
}

const log = (s: string) => process.stderr.write(`${s}\n`);

async function scan() {
  if (!arg) die('Usage: gapscout scan "<niche>"');
  const lang = langOpt();
  // GitHub and HN are English-speaking: outside English they mostly add noise to an LLM-free scan.
  const defaults: SourceId[] = lang === "en" ? ["hn", "stackexchange", "github", "appstore"] : ["stackexchange", "appstore"];
  const sources = (values.sources?.split(",").map((s) => s.trim()) ?? defaults) as SourceId[];
  for (const s of sources) if (!SOURCE_IDS.includes(s)) die(`Unknown source "${s}". Known: ${SOURCE_IDS.join(", ")}`);
  const sinceDays = values.since ? Number(values.since) : undefined;
  const limit = values.limit ? Number(values.limit) : 25;
  const queries = complaintQueries(arg, lang).slice(0, 3);

  const all = new Map<string, Complaint>();
  const notes = new Set<string>();
  for (const q of queries) {
    log(`→ searching "${q}" on ${sources.join(", ")}`);
    const res = await searchComplaints({ query: q, lang, sources, sinceDays, limit, country: values.country });
    for (const r of res.results) {
      for (const i of r.items) all.set(i.id, i);
      for (const n of r.notes) if (!/total hits|matching issues|quota remaining/.test(n)) notes.add(`${r.source}: ${n}`);
    }
  }
  const fetched = all.size;
  const items = [...all.values()].filter((c) => relevantToNiche(c, arg));
  log(`→ ${fetched} items fetched, ${items.length} mention the niche; extracting themes`);
  const themes = extractThemes(items, lang, arg.split(/\s+/), Number(values.themes));

  const demand: Record<string, Awaited<ReturnType<typeof keywordDemand>>> = {};
  if (!values["no-demand"]) {
    for (const t of themes) {
      log(`→ Google demand for "${t.phrase}"`);
      demand[t.phrase] = await keywordDemand({ seed: t.phrase, lang, country: values.country, depth: values.depth as never });
    }
  }

  const result = {
    niche: arg,
    lang,
    generatedAt: new Date().toISOString(),
    sources,
    itemCount: items.length,
    themes: themes.map((t) => ({
      phrase: t.phrase,
      mentions: t.items.length,
      sources: t.sources,
      avgPain: Math.round(t.avgPain * 100) / 100,
      demand: demand[t.phrase] && {
        score: demand[t.phrase]!.demandScore,
        suggestions: demand[t.phrase]!.suggestions.slice(0, 8).map((s) => s.keyword),
        volumes: demand[t.phrase]!.volumes,
      },
      evidence: t.items
        .sort((a, b) => (b.painHint ?? 0) - (a.painHint ?? 0))
        .slice(0, 4)
        .map((i) => ({ id: i.id, url: i.url, title: i.title, quote: truncate(i.text.replace(/\s+/g, " "), 220), pain: i.painHint })),
    })),
    topPainItems: items
      .sort((a, b) => (b.painHint ?? 0) - (a.painHint ?? 0))
      .slice(0, 10)
      .map((i) => ({ id: i.id, url: i.url, title: i.title, quote: truncate(i.text.replace(/\s+/g, " "), 220), pain: i.painHint, terms: i.painTerms })),
    notes: [...notes],
  };

  const md = renderRaw(result);
  if (values.out) {
    mkdirSync(values.out, { recursive: true });
    const slug = arg.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const base = join(values.out, `${slug}-${lang}-raw`);
    writeFileSync(`${base}.md`, md);
    writeFileSync(`${base}.json`, JSON.stringify(result, null, 2));
    log(`✓ wrote ${base}.md and ${base}.json`);
  }
  process.stdout.write(values.json ? JSON.stringify(result, null, 2) + "\n" : md);
}

function renderRaw(r: {
  niche: string; lang: string; generatedAt: string; sources: string[]; itemCount: number;
  themes: { phrase: string; mentions: number; sources: string[]; avgPain: number; demand?: { score: { value: number; why: string }; suggestions: string[] }; evidence: { url: string; title?: string; quote: string }[] }[];
  topPainItems: { url: string; title?: string; quote: string; pain?: number }[];
  notes: string[];
}): string {
  const o: string[] = [];
  o.push(`# gapscout raw scan · ${r.niche} (${r.lang})`, "");
  o.push(`_${r.generatedAt.slice(0, 10)} · ${r.itemCount} items from ${r.sources.join(", ")} · LLM-free n-gram themes. For clustered, scored opportunities run \`/gapscout\` in Claude Code._`, "");
  o.push("## Recurring themes", "");
  if (!r.themes.length)
    o.push(
      "_Not enough cross-source data to find themes without an LLM (a theme must appear in 2+ apps, repos or threads). " +
        "Below are the strongest individual complaints. For this language, run `/gapscout` in Claude Code: it adds Reddit (via web search) and review sites._",
      "",
    );
  else o.push("| Theme | Mentions | Sources | Pain | Google demand |", "|---|---|---|---|---|");
  for (const t of r.themes)
    o.push(`| ${t.phrase} | ${t.mentions} | ${t.sources.join(", ")} | ${t.avgPain} | ${t.demand ? `${t.demand.score.value}/5` : "–"} |`);
  o.push("");
  for (const t of r.themes) {
    o.push(`### ${t.phrase}`, "");
    if (t.demand) o.push(`Demand ${t.demand.score.value}/5 — ${t.demand.score.why}`, "", t.demand.suggestions.length ? `Autocomplete: ${t.demand.suggestions.map((s) => `\`${s}\``).join(", ")}` : "", "");
    for (const e of t.evidence) o.push(`- “${e.quote}” — [${e.title ? truncate(e.title, 70) : "source"}](${e.url})`);
    o.push("");
  }
  o.push("## Strongest pain signals", "");
  for (const e of r.topPainItems) o.push(`- (${e.pain}) “${e.quote}” — [${e.title ? truncate(e.title, 70) : "source"}](${e.url})`);
  o.push("");
  if (r.notes.length) {
    o.push("## Notes", "");
    for (const n of r.notes) o.push(`- ${n}`);
    o.push("");
  }
  return o.join("\n");
}

async function main() {
  if (values.help || !cmd) {
    process.stdout.write(HELP + "\n");
    return;
  }
  switch (cmd) {
    case "scan":
      return scan();
    case "demand": {
      if (!arg) die('Usage: gapscout demand "<keyword>"');
      const d = await keywordDemand({ seed: arg, lang: langOpt(), country: values.country, depth: values.depth as never });
      if (values.json) return void process.stdout.write(JSON.stringify(d, null, 2) + "\n");
      process.stdout.write(`Demand ${d.demandScore.value}/5 — ${d.demandScore.why}\n\n`);
      for (const s of d.suggestions) process.stdout.write(`${s.keyword}${d.volumes ? `\t${d.volumes[s.keyword] ?? "–"}` : ""}\n`);
      for (const n of d.notes) process.stderr.write(`note: ${n}\n`);
      return;
    }
    case "search": {
      if (!arg) die('Usage: gapscout search "<query>"');
      const list = (s?: string) => s?.split(",").map((x) => x.trim()).filter(Boolean);
      const sources = list(values.sources) as SourceId[] | undefined;
      for (const s of sources ?? []) if (!SOURCE_IDS.includes(s)) die(`Unknown source "${s}". Known: ${SOURCE_IDS.join(", ")}`);
      const out = await searchComplaints({
        query: arg,
        lang: langOpt(),
        sources,
        sinceDays: values.since ? Number(values.since) : undefined,
        limit: values.limit ? Number(values.limit) : undefined,
        country: values.country,
        seSites: list(values["se-sites"]),
        subreddits: list(values.subreddits),
        discourseDomains: list(values["discourse-domains"]),
      });
      for (const r of out.results) r.items = r.items.map((i) => ({ ...i, text: truncate(i.text, 500) }));
      return void process.stdout.write(JSON.stringify(out, null, 1) + "\n");
    }
    case "serp": {
      if (!arg) die('Usage: gapscout serp "<query>" [--results top10.json]');
      const results = values.results ? JSON.parse(readFileSync(values.results, "utf8")) : undefined;
      if (!results && !hasDataForSEO())
        die("serp needs --results <file.json> ([{position,url,title}] from your web search) or DATAFORSEO_LOGIN/PASSWORD.");
      const s = await serpSnapshot({ query: arg, lang: langOpt(), country: values.country, results });
      return void process.stdout.write(JSON.stringify(s, null, 2) + "\n");
    }
    case "fetch": {
      if (!arg) die("Usage: gapscout fetch <url>");
      const p = await fetchPage(arg);
      return void process.stdout.write(JSON.stringify({ url: p.url, title: p.title, chars: p.text.length, text: truncate(p.text, 20000) }, null, 2) + "\n");
    }
    case "verify": {
      const [url, ...q] = rest;
      if (!url || !q.length) die('Usage: gapscout verify <url> "<quote>"');
      return void process.stdout.write(JSON.stringify(await verifyQuote(url, q.join(" ")), null, 2) + "\n");
    }
    case "thread": {
      if (!arg) die("Usage: gapscout thread <id>");
      return void process.stdout.write(JSON.stringify(await getThread(arg), null, 2) + "\n");
    }
    case "cache": {
      const c = getCache();
      if (!c.path) return void process.stdout.write("Cache is in memory only (GAPSCOUT_NO_CACHE=1 or node:sqlite unavailable).\n");
      if (arg === "clear") {
        // -wal / -shm are SQLite side files; they may not exist.
        for (const f of [c.path, `${c.path}-wal`, `${c.path}-shm`]) rmSync(f, { force: true });
        return void process.stdout.write(`Cleared ${c.path}\n`);
      }
      return void process.stdout.write(`${c.path} (${(statSync(c.path).size / 1e6).toFixed(1)} MB). Clear it with: gapscout cache clear\n`);
    }
    case "render": {
      if (!arg) die("Usage: gapscout render <report.json>");
      const report = JSON.parse(readFileSync(arg, "utf8")) as Report;
      if (values.json) return void process.stdout.write(JSON.stringify(withScores(report), null, 2) + "\n");
      return void process.stdout.write(renderReport(report));
    }
    default:
      die(`Unknown command "${cmd}".\n\n${HELP}`);
  }
}

main().catch((e) => die(`gapscout: ${(e as Error).message}`));
