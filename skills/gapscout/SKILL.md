---
name: gapscout
description: Find and validate business/product opportunities in a niche — recurring problems people complain about online (forums and communities incl. Bluesky and Discourse, Reddit via Google/DataForSEO, Hacker News, Stack Exchange, GitHub issues, app and product reviews), checked against Google search demand and SERP weakness. Use when the user wants to find a niche, validate an idea, discover pain points, do market or customer research, find SEO opportunities, or asks "what should I build". Works in English, French, German and Spanish.
---

# gapscout — find problems worth building

Complaints prove pain. Google proves people look for a fix. An opportunity needs both.

## Two ways to run it
- **Full pipeline (preferred):** the `/gapscout "<niche>" --lang fr` command orchestrates 8 sub-agents: query-planner → forums/hn-dev/reviews scouts (parallel) → clusterer → demand-validators (parallel) → skeptic → reporter. Output: `gapscout-reports/<slug>-<lang>-<date>.md` and `.json`.
- **Quick look (no sub-agents):** call the gapscout MCP tools directly — `search_complaints` → `get_thread` → `keyword_demand` → `serp_snapshot` → `score_opportunity` / `render_report`. Good for checking one idea.

## The score
`score = frequency × intensity × demand × SERP weakness`, each **1–5 with a written reason**, shown as 0–100 via the geometric mean (all factors at 3/5 = 50; same ranking as the product).

| Factor | 1 | 3 | 5 |
|---|---|---|---|
| Frequency (distinct people; +1 if 3+ sources) | 1–2 mentions | 6–10 | 21+ |
| Intensity | mild annoyance | time/money lost, painful workaround | explicit willingness to pay, business at risk |
| Demand (volumes / or Autocomplete proxy) | <50 searches/mo · 0 suggestions | 200–999 · 4–9 | 5,000+ · 25+ |
| SERP weakness | authority sites & strong dedicated tools own page 1 | mixed | forums/Reddit/Q&A in the top 3, no dedicated tool |

## Non-negotiables
- **Every claim has a verbatim quote and a URL.** Never paraphrase inside quotes, never invent evidence, never pad a report to reach 10 items.
- **Reddit only through Google results via DataForSEO** (`site:reddit.com …`). Claude's own web search and fetch tools cannot access reddit.com, so without DataForSEO Reddit is skipped and forums carry that role. Never the Reddit API, mirrors, or anything that gets around a restriction. Same for review sites: snippets and pages the site serves normally.
- **Language-native.** Queries, keywords and the report are in the target language; HN/GitHub queries stay English.
- **Free by default.** Google Autocomplete is the demand signal unless `DATAFORSEO_LOGIN`/`DATAFORSEO_PASSWORD` are set; say "Autocomplete proxy" when there are no volumes.

## Optional keys (environment)
`GITHUB_TOKEN` (higher GitHub limits) · `STACKEXCHANGE_KEY` (10k req/day instead of 300) · `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` (search volumes + SERP, from $0.0006/SERP page).
