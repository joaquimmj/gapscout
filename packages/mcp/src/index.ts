// gapscout MCP server (stdio). Same tools for Claude Code, Cursor, Codex and any MCP host.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  fetchPage,
  normalizeForMatch,
  verifyQuote,
  getThread,
  keywordDemand,
  LANGS,
  opportunityScore,
  renderReport,
  searchComplaints,
  serpSnapshot,
  SOURCE_IDS,
  truncate,
  withScores,
  VERSION,
  type Report,
} from "../../core/src/index.js";


const lang = z.enum(LANGS as unknown as [string, ...string[]]).describe("Language of queries and output: en, fr, de, es");
const score = z.object({ value: z.number().int().min(1).max(5), why: z.string() });

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] }; // compact: tool output is paid for in tokens on every call
}
function fail(e: unknown) {
  return { isError: true, content: [{ type: "text" as const, text: `gapscout error: ${(e as Error)?.message ?? String(e)}` }] };
}

const server = new McpServer(
  { name: "gapscout", version: VERSION },
  {
    instructions:
      "gapscout finds recurring problems people complain about online and checks whether people search Google for a solution. " +
      "Flow: search_complaints → get_thread / fetch_page (to read and quote verbatim) → verify_quote → keyword_demand + serp_snapshot (to validate) → score_opportunity → render_report. " +
      "Reddit only via Google results when DataForSEO is configured — never the Reddit API, never reddit.com directly. " +
      "Always quote real text with its URL; never invent evidence.",
  },
);

server.registerTool(
  "search_complaints",
  {
    title: "Search complaints",
    description:
      "Search public sources (Hacker News, Stack Exchange, GitHub issues, App Store 1–3★ reviews, Bluesky, Discourse forums, Reddit via DataForSEO) for posts where people describe a problem. " +
      "Returns items ranked by pain signal + engagement, with ids usable in get_thread. Text is truncated; open threads you want to quote.",
    inputSchema: {
      query: z.string().min(2).describe("Search query, ideally a niche + problem phrase, in the target language"),
      lang,
      sources: z.array(z.enum(SOURCE_IDS as unknown as [string, ...string[]])).optional().describe("Default: all"),
      since_days: z.number().int().positive().optional().describe("Only items newer than N days (default: no limit)"),
      limit: z.number().int().min(1).max(100).optional().describe("Max items per source (default 15)"),
      country: z.string().length(2).optional().describe("ISO country for App Store / SERP, default from lang"),
      se_sites: z.array(z.string()).optional().describe("Stack Exchange sites, e.g. ['money','freelancing','superuser']"),
      subreddits: z.array(z.string()).optional().describe("Restrict Reddit searches to these subreddits (DataForSEO only)"),
      discourse_domains: z.array(z.string()).optional().describe("Discourse forums to search, e.g. ['forum.code.org', 'community.n8n.io']"),
      pain_only: z.boolean().optional().describe("Drop items with no pain signal (default false)"),
      max_chars: z.number().int().min(100).max(4000).optional().describe("Truncate each item's text (default 300); open threads to quote more"),
    },
  },
  async (a) => {
    try {
      const out = await searchComplaints({
        query: a.query,
        lang: a.lang as Report["lang"],
        sources: a.sources as never,
        sinceDays: a.since_days,
        limit: a.limit,
        country: a.country,
        seSites: a.se_sites,
        subreddits: a.subreddits,
        discourseDomains: a.discourse_domains,
        painOnly: a.pain_only,
      });
      const max = a.max_chars ?? 300;
      for (const r of out.results)
        r.items = r.items.map((i) => ({ ...i, text: truncate(i.text, max), painTerms: i.painTerms?.length ? i.painTerms : undefined }));
      return json(out);
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "get_thread",
  {
    title: "Get thread",
    description:
      "Fetch the full text and replies of an item returned by search_complaints (ids starting with hn:, se:, gh:, bs:, dc:). Use it before quoting. Reddit threads: use your web fetch tool on the URL instead.",
    inputSchema: {
      id: z.string().describe('Item id from search_complaints, e.g. "hn:41234567", "se:superuser:123", "gh:owner/repo#42", "bs:did:…/app.bsky.feed.post/…", "dc:forum.code.org:895:28"'),
      max_chars: z.number().int().min(500).max(30000).optional().describe("Total budget for the returned text (default 8000)"),
    },
  },
  async ({ id, max_chars }) => {
    try {
      const t = await getThread(id);
      const budget = max_chars ?? 8000;
      const text = truncate(t.text, Math.floor(budget / 3));
      let left = budget - text.length;
      const replies = [];
      for (const r of t.replies) {
        if (left <= 0) break;
        const rt = truncate(r.text, Math.min(1200, left));
        left -= rt.length;
        replies.push({ ...r, text: rt });
      }
      return json({ ...t, text, replies, repliesShown: replies.length, repliesTotal: t.replies.length });
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "fetch_page",
  {
    title: "Fetch page (raw text)",
    description:
      "Fetch a forum/review/web page and return its raw text, so you can copy quotes verbatim (generic web-fetch tools may summarise pages). " +
      "Honours robots.txt, never fetches reddit.com. Use `find` to get only the passages around a phrase.",
    inputSchema: {
      url: z.string().url(),
      find: z.string().optional().describe("Return only passages containing this phrase (case/accent-insensitive)"),
      max_chars: z.number().int().min(500).max(30000).optional().describe("Default 6000"),
    },
  },
  async ({ url, find, max_chars }) => {
    try {
      const page = await fetchPage(url);
      const budget = max_chars ?? 6000;
      let text = page.text;
      if (find) {
        const needle = normalizeForMatch(find);
        const paras = page.text.split(/\n+/).filter((p) => normalizeForMatch(p).includes(needle));
        text = paras.length ? paras.join("\n\n") : `(no passage contains "${find}")`;
      }
      return json({ url: page.url, title: page.title, chars: page.text.length, text: truncate(text, budget) });
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "verify_quote",
  {
    title: "Verify quote",
    description:
      "Check that a quote really appears on its source page. Returns exact | close | not_found | unreachable, with the matching excerpt from the page. " +
      "Quotes from search_complaints/get_thread (HN, Stack Exchange, GitHub, App Store) are verbatim by construction; verify web/forum quotes.",
    inputSchema: {
      checks: z.array(z.object({ url: z.string().url(), quote: z.string().min(10) })).min(1).max(30),
    },
  },
  async ({ checks }) => {
    // Hosts in parallel, one request at a time per host (polite); results keep the input order.
    const byHost = new Map<string, number[]>();
    checks.forEach((c, i) => {
      const h = new URL(c.url).host;
      byHost.set(h, [...(byHost.get(h) ?? []), i]);
    });
    const results = new Array(checks.length);
    await Promise.all(
      [...byHost.values()].map(async (idxs) => {
        for (const i of idxs) {
          const c = checks[i]!;
          results[i] = { quote: truncate(c.quote, 120), ...(await verifyQuote(c.url, c.quote)) };
        }
      }),
    );
    return json(results);
  },
);

server.registerTool(
  "keyword_demand",
  {
    title: "Keyword demand",
    description:
      "Validate Google demand for a problem: expands a seed with Google Autocomplete (questions, 'alternative', 'not working'…) in the target language/country, " +
      "adds monthly volumes when DataForSEO is configured, and returns a 1–5 demand score with its reason.",
    inputSchema: {
      seed: z.string().min(2).describe("Short keyword describing the problem or the solution people would search for"),
      lang,
      country: z.string().length(2).optional(),
      depth: z.enum(["quick", "normal", "deep"]).optional().describe("quick≈8 calls, normal≈16, deep≈42 (adds a–z)"),
      must_include: z.array(z.string()).optional().describe("Keep only suggestions containing one of these words"),
    },
  },
  async (a) => {
    try {
      return json(
        await keywordDemand({
          seed: a.seed,
          lang: a.lang as Report["lang"],
          country: a.country,
          depth: a.depth,
          mustInclude: a.must_include,
        }),
      );
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "serp_snapshot",
  {
    title: "SERP snapshot",
    description:
      "Judge how beatable Google page 1 is for a query (forums/Q&A ranking high = weak SERP = opportunity). " +
      "With DataForSEO configured it fetches the SERP itself; otherwise run the query with your web search tool and pass the top results in `results`.",
    inputSchema: {
      query: z.string().min(2),
      lang,
      country: z.string().length(2).optional(),
      results: z
        .array(z.object({ position: z.number().int(), url: z.string(), title: z.string(), snippet: z.string().optional() }))
        .optional()
        .describe("Top results from your own web search, in rank order"),
    },
  },
  async (a) => {
    try {
      return json(await serpSnapshot({ query: a.query, lang: a.lang as Report["lang"], country: a.country, results: a.results }));
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "score_opportunity",
  {
    title: "Score opportunity",
    description: "Combine the four 1–5 factors into the gapscout score: frequency × intensity × demand × SERP weakness (product, max 625), and as 0–100 via the geometric mean (50 = all factors at 3/5).",
    inputSchema: { frequency: score, intensity: score, demand: score, serp_weakness: score },
  },
  async (a) => {
    const s = opportunityScore(a.frequency as never, a.intensity as never, a.demand as never, a.serp_weakness as never);
    return json(s);
  },
);

const evidence = z.object({
  quote: z.string(),
  url: z.string(),
  source: z.string(),
  verified: z.enum(["api", "exact", "close", "manual", "snippet"]).optional(),
});
const opportunity = z.object({
  title: z.string(),
  problem: z.string(),
  audience: z.string().optional(),
  evidence: z.array(evidence).min(1),
  frequency: score,
  intensity: score,
  demand: score,
  serpWeakness: score,
  keywords: z.array(z.object({ keyword: z.string(), volume: z.number().nullable().optional() })),
  productIdea: z.string(),
  gap: z.string().optional(),
  competitors: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
});

server.registerTool(
  "render_report",
  {
    title: "Render report",
    description: "Turn the final opportunities JSON into the standard gapscout Markdown report (sorted by score, localized headings). Returns { markdown, json }.",
    inputSchema: {
      niche: z.string(),
      lang,
      sources_used: z.array(z.string()),
      opportunities: z.array(opportunity),
      discarded: z.array(z.object({ title: z.string(), reason: z.string() })).optional(),
      notes: z.array(z.string()).optional().describe("Run-wide caveats: sources skipped, free mode, thin coverage"),
    },
  },
  async (a) => {
    try {
      const report: Report = {
        niche: a.niche,
        lang: a.lang as Report["lang"],
        generatedAt: new Date().toISOString(),
        sourcesUsed: a.sources_used,
        opportunities: a.opportunities as Report["opportunities"],
        discarded: a.discarded,
        notes: a.notes,
      };
      return {
        content: [
          { type: "text" as const, text: renderReport(report) },
          { type: "text" as const, text: JSON.stringify(withScores(report), null, 2) },
        ],
      };
    } catch (e) {
      return fail(e);
    }
  },
);

await server.connect(new StdioServerTransport());
