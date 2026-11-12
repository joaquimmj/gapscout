# Contributing to gapscout

Thanks for helping! The most useful contributions, in order:

1. **A new source adapter** (Product Hunt comments, YouTube comments, Google Play reviews, Discourse forums, Lemmy, Mastodon…).
2. **A new language pack** in `packages/core/src/i18n.ts` (pain phrases, willingness-to-pay phrases, autocomplete modifiers, stopwords).
3. **Better prompts** for the sub-agents in `agents/` — ideally with a before/after report on the same niche.

## Adding a source

1. Create `packages/core/src/sources/<name>.ts` exporting `search<Name>(query, opts): Promise<SourceResult>` (and `get<Name>Thread(id)` if the source has threads). Use `fetchJson` from `../http.js` — it handles the cache, timeouts, retries and the User-Agent.
2. Give items a stable, prefixed `id` (`ph:…`, `yt:…`).
3. Add the id to `SourceId` / `SOURCE_IDS` in `types.ts` and wire it in `scan.ts` (`searchComplaints` and, if relevant, `getThread`).
4. **Document the source's terms** at the top of the file and in the README's "Sources and their terms" table. Rule: use only what the source offers publicly or through an official API; never get around a block, rate limit, login wall or robots rule. If a source needs a key, make it optional and say so in `notes`.
5. Point the right scout in `agents/` at it.
6. `npm run build && npm test`, then run a real scan and paste the output in the PR.

## Running it locally

`claude --plugin-dir /path/to/gapscout` from **another** folder. If you open the repo itself in Claude Code, its `.mcp.json` is also read as project config, where `${CLAUDE_PLUGIN_ROOT}` is unset, so you get a harmless "Missing environment variables" warning and a duplicate pending `gapscout` server. Don't "fix" it with `${CLAUDE_PLUGIN_ROOT:-.}`: that breaks real plugin installs, because the server path would resolve against the user's folder.

## Ground rules

- Every piece of evidence must be a verbatim quote with a URL. No feature may generate or "improve" quotes.
- Free by default; paid providers are optional and clearly labelled.
- Keep `dist/` in sync: run `npm run build` before committing (the plugin runs `dist/mcp.mjs`).
- Releasing: bump `version` in `package.json`, `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`. The MCP server and the User-Agent read it from `package.json` at build time.
