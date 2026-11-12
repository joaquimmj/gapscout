<p align="center"><img src=".claude-plugin/icon.png" width="96" alt="gapscout"></p>

<h1 align="center">gapscout</h1>

<p align="center"><b>Find problems worth building — proven by real complaints and real Google demand.</b><br>
The open source GummySearch alternative, native to Claude Code. Works without the Reddit API.</p>

<p align="center">
<code>/gapscout "freelance accounting" --lang en</code>
</p>

<!-- TODO: 20-second GIF of a full run goes here -->

---

**Reddit closes its public API to everyone in March 2027.** Social-listening tools are losing their main source; GummySearch stopped taking customers in November 2025 and shuts down for good on 1 December 2026. gapscout never needed that API.

gapscout sends parallel sub-agents to find **recurring problems people complain about** — in forums and communities (incl. Bluesky and Discourse), on Hacker News, Stack Exchange, GitHub issues, App Store reviews, Trustpilot/G2/Capterra, and Reddit through Google results (optional DataForSEO key) — then does the step nobody else does: it checks **whether people actually search Google for a fix**, and **how beatable page 1 is**.

You get a ranked report of 5–10 opportunities. Each one has:

- **verbatim quotes with links** — every claim is traceable
- **frequency** and **intensity** of the pain
- **Google keywords**, their demand (and monthly volumes if you add a DataForSEO key)
- **SERP weakness** — forums and Reddit in the top 3 means nobody owns the answer yet
- a **skeptic's notes** (existing competitors, risks) and a concrete **product idea**

In **English, French, German and Spanish** — queries, keywords and report.

## Install (Claude Code)

```bash
/plugin marketplace add joaquimmj/gapscout
/plugin install gapscout@gapscout
```

Then:

```bash
/gapscout "comptabilité freelance" --lang fr
/gapscout "tools for teachers" --lang en --depth deep
/gapscout "Buchhaltung Freelancer" --lang de,en
/gapscout "tools for teachers" --cheap
```

Reports are saved to `gapscout-reports/<niche>-<lang>-<date>.md` and `.json`.

## How it works

```
                       ┌─ forums-scout   (per language · Bluesky, Discourse, forums, job boards · Reddit via Google)
query-planner ──►  ────┼─ hn-dev-scout   (HN · Stack Exchange · GitHub issues)        ──► clusterer
                       └─ reviews-scout  (per language · App Store 1–3★ · Trustpilot/G2/Capterra)
                                                                                           │
reporter ◄── skeptic ◄──  demand-validator × N  (Google Autocomplete · volumes · SERP) ◄───┘
```

Eight Claude Code sub-agents, each with its own context, so a deep scan doesn't flood your conversation. Scouts run in parallel on Haiku; clustering and demand validation on Sonnet; the skeptic and the reporter on Opus.

### What a scan costs

A scan launches 10 to 13 sub-agent runs and takes 10 to 15 minutes: 3 scouts on Haiku, 5 or 6 planning, clustering and validation runs on Sonnet, and the skeptic and the reporter on Opus. It uses your Claude plan or API credit like any Claude Code session; the data sources are free unless you add DataForSEO.

- `--depth quick` runs fewer queries per source.
- `--cheap` runs the skeptic and the reporter on Sonnet instead of Opus.

We have not yet measured token totals on a plain Claude Code install; numbers will be added here when we have them.

**Score = frequency × intensity × Google demand × SERP weakness**, each rated 1–5 with its reason shown, displayed 0–100 through the geometric mean (all factors at 3/5 = 50).

| Factor | 1 | 3 | 5 |
|---|---|---|---|
| Frequency | 1–2 people | 6–10 | 21+ (and +1 if seen on 3+ sources) |
| Intensity | mild annoyance | time or money lost, painful workaround | "I'd pay for this", business at risk |
| Google demand | no suggestions / <50 searches/mo | 4–9 suggestions / 200–999 | 25+ suggestions / 5,000+ |
| SERP weakness | authorities and strong tools own page 1 | mixed | forums, Reddit, Q&A in the top 3 |

## Three ways in, one engine

| | For | How |
|---|---|---|
| **Claude Code plugin** | the full pipeline with sub-agents | `/gapscout "<niche>"` |
| **MCP server** | Cursor, Codex, Claude Desktop, any MCP host | `npx -y -p gapscout gapscout-mcp` |
| **CLI** | a raw, LLM-free scan in your terminal | `npx gapscout scan "<niche>" --lang fr` |

MCP tools: `search_complaints`, `get_thread`, `keyword_demand`, `serp_snapshot`, `score_opportunity`, `render_report`.

The CLI mirrors them, printing the same JSON — handy for scripts and for agents without MCP:

```bash
npx gapscout search "relance facture impayée" --lang fr --sources appstore,stackexchange
npx gapscout thread hn:43381182
npx gapscout demand "calcul urssaf freelance" --lang fr --json
npx gapscout serp "calcul urssaf freelance" --lang fr --results top10.json
npx gapscout render report.json
```

<details>
<summary>MCP config for other hosts</summary>

```json
{
  "mcpServers": {
    "gapscout": { "command": "npx", "args": ["-y", "-p", "gapscout", "gapscout-mcp"] }
  }
}
```
</details>

The CLI groups complaints into n-gram themes without an LLM — good for a quick look, see [`examples/raw/`](examples/raw/). The clustered, skeptic-checked reports come from the plugin.

## Zero config, optional keys

Everything works out of the box. Keys only raise limits or add data:

| Variable | What it adds | Cost |
|---|---|---|
| `GITHUB_TOKEN` | 30 GitHub searches/min instead of 10 | free |
| `STACKEXCHANGE_KEY` | 10,000 requests/day instead of 300 ([stackapps.com](https://stackapps.com/apps/oauth/register)) | free |
| `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` | real monthly search volumes, SERP fetched for you, **Reddit** (via Google results) | pay-as-you-go, from $0.0006 per SERP page |

Without DataForSEO, demand is measured with Google Autocomplete (free, no volumes — the report says "Autocomplete proxy") and the SERP comes from Claude's own web search.

Responses are cached in a local SQLite file (`~/.cache/gapscout/cache.db`) so re-running a scan downloads nothing twice. `GAPSCOUT_NO_CACHE=1` disables it.

## Sources and their terms

gapscout **never scrapes around a restriction**. Each adapter uses what the source offers publicly:

| Source | Access | Notes |
|---|---|---|
| Hacker News | [Algolia HN Search API](https://hn.algolia.com/api), no key | |
| Stack Exchange | [API 2.3](https://api.stackexchange.com/docs), honours `backoff` | 300 req/day without key |
| GitHub issues | [REST search API](https://docs.github.com/en/rest/search) | token optional |
| App Store | iTunes Search API + public customer-review feed | 1–3★ reviews only |
| Bluesky | [public AppView API](https://docs.bsky.app/) (`searchPosts`), no key | the API is what Bluesky asks bots to use |
| Discourse forums | each forum's own `/search.json` | only forums you name; robots.txt honoured |
| Reddit | Google results (`site:reddit.com …`) via DataForSEO | never the Reddit API, no mirrors. Claude's own web tools can't reach reddit.com, so without DataForSEO Reddit is skipped |
| Forums & communities | web search + pages as served (forums, Quora, public-service feedback, freelance job boards) | |
| Trustpilot / G2 / Capterra | web search snippets, pages as served | no pagination, no bypass |
| Google demand | Google Autocomplete (`hl`/`gl`), DataForSEO optional | |

## Develop

```bash
npm install
npm run build   # typecheck + bundle dist/{core,mcp,cli}.mjs
npm test
node dist/cli.mjs scan "invoicing freelancers" --lang en
```

Try the plugin from a local checkout: `claude --plugin-dir .` then `/gapscout "…"`.

`dist/` is committed on purpose: the plugin's `.mcp.json` runs `dist/mcp.mjs` directly, so installing the plugin needs no `npm install`.

Repo map: `commands/` (the `/gapscout` command) · `agents/` (8 sub-agents) · `skills/gapscout/` (the method) · `packages/core` (source adapters, demand, scoring, report) · `packages/mcp` · `packages/cli`.

**Adding a source** is the best first contribution — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. If gapscout finds you something worth building, a ⭐ helps others find it too.
