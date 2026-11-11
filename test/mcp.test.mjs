// Smoke test: the bundled MCP server starts over stdio and exposes the six tools.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("mcp server lists tools and scores offline", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/mcp.mjs"],
    env: { ...process.env, GAPSCOUT_NO_CACHE: "1" },
  });
  const client = new Client({ name: "gapscout-test", version: "0" });
  await client.connect(transport);
  try {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, [
      "fetch_page",
      "get_thread",
      "keyword_demand",
      "render_report",
      "score_opportunity",
      "search_complaints",
      "serp_snapshot",
      "verify_quote",
    ]);
    const s = (v) => ({ value: v, why: "t" });
    const res = await client.callTool({
      name: "score_opportunity",
      arguments: { frequency: s(4), intensity: s(4), demand: s(3), serp_weakness: s(5) },
    });
    assert.deepEqual(JSON.parse(res.content[0].text), { product: 240, outOf100: 73 });
    const serp = await client.callTool({
      name: "serp_snapshot",
      arguments: { query: "relance facture", lang: "fr", results: [{ position: 1, url: "https://reddit.com/r/a/comments/b", title: "relance facture ?" }] },
    });
    assert.ok(JSON.parse(serp.content[0].text).weakness.value >= 2);
  } finally {
    await client.close();
  }
});
