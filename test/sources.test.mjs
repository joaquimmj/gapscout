// One test per source adapter, on canned responses shaped like the real APIs.
// If an API renames a field, the adapter keeps "working" but returns empty text: these tests catch that.
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.GAPSCOUT_NO_CACHE = "1";
const { searchComplaints, getThread, renderReportHtml } = await import("../dist/core.mjs");

const json = (data) => new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" } });

/** Route fetch by URL substring; unknown URLs fail the test loudly. */
async function withApi(routes, fn) {
  const realFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url) => {
    seen.push(String(url));
    const key = Object.keys(routes).find((k) => String(url).includes(k));
    if (!key) return new Response("no route", { status: 404 });
    return routes[key](String(url));
  };
  try {
    return await fn(seen);
  } finally {
    globalThis.fetch = realFetch;
  }
}

const one = async (source, extra = {}) => (await searchComplaints({ query: "late invoice", lang: "en", sources: [source], ...extra })).results[0];

test("hn: maps stories and comments, drops hiring threads", async () => {
  await withApi(
    {
      "hn.algolia.com/api/v1/search": () =>
        json({
          nbHits: 3,
          hits: [
            { objectID: "11", title: "Ask HN: How do you chase late invoices?", story_text: "I hate doing this by hand.", author: "a", points: 120, num_comments: 40, created_at: "2026-01-02T00:00:00Z", _tags: ["story"] },
            { objectID: "12", story_title: "Invoicing tools", comment_text: "It&#x27;s a <i>nightmare</i>.<p>Is there a tool?", author: "b", created_at: "2026-01-03T00:00:00Z", _tags: ["comment"] },
            { objectID: "13", story_title: "Ask HN: Who is hiring? (January 2026)", comment_text: "We need an invoicing engineer", _tags: ["comment"] },
          ],
        }),
    },
    async () => {
      const r = await one("hn");
      assert.deepEqual(r.items.map((i) => i.id).sort(), ["hn:11", "hn:12"]);
      const c = r.items.find((i) => i.id === "hn:12");
      assert.equal(c.text, "It's a nightmare.\nIs there a tool?");
      assert.equal(c.title, "Invoicing tools");
      assert.equal(c.url, "https://news.ycombinator.com/item?id=12");
      assert.ok(c.painHint > 0);
    },
  );
});

test("hn thread: a comment is shown with its story's discussion", async () => {
  await withApi(
    {
      "/items/12": () => json({ id: 12, type: "comment", story_id: 10, text: "Mine", children: [] }),
      "/items/10": () => json({ id: 10, type: "story", title: "Invoicing tools", children: [{ id: 12, text: "Mine" }, { id: 14, text: "Same here", author: "z" }] }),
    },
    async () => {
      const t = await getThread("hn:12");
      assert.equal(t.title, "Invoicing tools");
      assert.deepEqual(t.replies.map((x) => x.text), ["Same here"]);
    },
  );
});

test("stackexchange: one request per site, body decoded", async () => {
  await withApi(
    {
      "api.stackexchange.com/2.3/search/advanced": (url) =>
        json({ quota_remaining: 280, items: [{ question_id: 7, title: "Client won&#39;t pay", body: "<p>Three months <b>late</b>.</p>", link: `https://x/q/7?site=${new URL(url).searchParams.get("site")}`, score: 9, answer_count: 2, creation_date: 1767225600 }] }),
    },
    async (seen) => {
      const r = await one("stackexchange", { seSites: ["freelancing", "money"] });
      assert.equal(seen.length, 2);
      assert.deepEqual(r.items.map((i) => i.id).sort(), ["se:freelancing:7", "se:money:7"]);
      assert.equal(r.items[0].title, "Client won't pay");
      assert.equal(r.items[0].text, "Three months late.");
      assert.ok(r.notes.some((n) => n.includes("280")));
    },
  );
});

test("github: repo-prefixed id and title, HTML comments stripped", async () => {
  await withApi(
    {
      "api.github.com/search/issues": () =>
        json({ total_count: 1, items: [{ number: 42, title: "Recurring invoices", body: "<!-- template -->\nPlease add this.", html_url: "https://github.com/o/r/issues/42", repository_url: "https://api.github.com/repos/o/r", user: { login: "u" }, created_at: "2026-02-01T00:00:00Z", comments: 3, reactions: { total_count: 17 } }] }),
    },
    async () => {
      const [i] = (await one("github")).items;
      assert.equal(i.id, "gh:o/r#42");
      assert.equal(i.title, "[o/r] Recurring invoices");
      assert.equal(i.text, "Please add this.");
      assert.equal(i.engagement, 17);
    },
  );
});

test("appstore: keeps 1–3★ reviews only and links to the reviews list", async () => {
  await withApi(
    {
      "itunes.apple.com/search": () => json({ results: [{ trackId: 5, trackName: "Billr", trackViewUrl: "https://apps.apple.com/us/app/billr/id5?uo=4", averageUserRating: 4.1, userRatingCount: 900 }] }),
      "/rss/customerreviews/": () =>
        json({
          feed: {
            entry: [
              { id: { label: "r1" }, author: { name: { label: "sam" } }, "im:rating": { label: "1" }, title: { label: "Paywall" }, content: { label: "Everything is locked." }, updated: { label: "2026-10-01T00:00:00-07:00" } },
              { id: { label: "r2" }, "im:rating": { label: "5" }, title: { label: "Great" }, content: { label: "Love it" }, updated: { label: "2026-10-02T00:00:00-07:00" } },
            ],
          },
        }),
    },
    async () => {
      const r = await one("appstore");
      assert.equal(r.items.length, 1);
      assert.equal(r.items[0].id, "as:us:5:r1");
      assert.equal(r.items[0].rating, 1);
      assert.equal(r.items[0].url, "https://apps.apple.com/us/app/billr/id5?see-all=reviews");
      assert.equal(r.items[0].title, "[Billr · 1★] Paywall");
    },
  );
});

test("bluesky: builds the public post URL, skips very short posts", async () => {
  await withApi(
    {
      "api.bsky.app/xrpc/app.bsky.feed.searchPosts": () =>
        json({
          hitsTotal: 2,
          posts: [
            { uri: "at://did:plc:abc/app.bsky.feed.post/3k1", author: { handle: "ann.bsky.social" }, record: { text: "Chasing late invoices is the part of freelancing I hate most.", createdAt: "2026-03-01T00:00:00Z" }, likeCount: 4, repostCount: 1, replyCount: 2 },
            { uri: "at://did:plc:abc/app.bsky.feed.post/3k2", author: { handle: "ann.bsky.social" }, record: { text: "ugh invoices" } },
          ],
        }),
    },
    async () => {
      const r = await one("bluesky");
      assert.equal(r.items.length, 1);
      assert.equal(r.items[0].url, "https://bsky.app/profile/ann.bsky.social/post/3k1");
      assert.equal(r.items[0].id, "bs:did:plc:abc/app.bsky.feed.post/3k1");
      assert.equal(r.items[0].engagement, 5);
    },
  );
});

test("discourse: searches only named forums, links to the exact post", async () => {
  await withApi(
    {
      "1.1.1.1/robots.txt": () => new Response("", { status: 404 }),
      "1.1.1.1/search.json": () => json({ posts: [{ id: 900, topic_id: 30, post_number: 4, username: "kim", blurb: "The export is <b>broken</b> again", like_count: 6, created_at: "2026-04-01T00:00:00Z" }], topics: [{ id: 30, title: "Export problems", slug: "export-problems", posts_count: 12 }] }),
    },
    async () => {
      const r = await one("discourse", { discourseDomains: ["1.1.1.1"] });
      assert.equal(r.items[0].id, "dc:1.1.1.1:30:4");
      assert.equal(r.items[0].url, "https://1.1.1.1/t/export-problems/30/4");
      assert.equal(r.items[0].text, "The export is broken again");
      const none = await one("discourse");
      assert.equal(none.items.length, 0);
      assert.match(none.notes[0], /No Discourse domains/);
    },
  );
});

test("reddit: without DataForSEO nothing is fetched, queries are returned", async () => {
  await withApi({}, async (seen) => {
    const r = await one("reddit", { subreddits: ["freelance"] });
    assert.equal(seen.length, 0, "must not call any network endpoint");
    assert.deepEqual(r.hostSearchQueries, ["site:reddit.com/r/freelance late invoice"]);
  });
});

test("one failing source does not sink the others", async () => {
  await withApi(
    { "hn.algolia.com": () => json({ nbHits: 0, hits: [] }), "api.github.com": () => new Response("rate limited", { status: 403 }) },
    async () => {
      const out = await searchComplaints({ query: "x y", lang: "en", sources: ["hn", "github"] });
      assert.equal(out.results[0].items.length, 0);
      assert.match(out.results[1].notes[0], /error: HTTP 403/);
    },
  );
});

test("HTML report: escapes content and never renders non-http links", () => {
  const s = (v) => ({ value: v, why: "<img src=x onerror=alert(1)>" });
  const html = renderReportHtml({
    niche: "<script>alert(1)</script>",
    lang: "en",
    generatedAt: "2026-11-12T00:00:00Z",
    sourcesUsed: ["hn"],
    opportunities: [{ title: "T", problem: "P", evidence: [{ quote: "q", url: "javascript:alert(1)", source: "forum" }, { quote: "q2", url: "https://ok.example/x", source: "hn", verified: "api" }], frequency: s(3), intensity: s(3), demand: s(3), serpWeakness: s(3), keywords: [], productIdea: "I" }],
  });
  assert.ok(!html.includes("<script>alert"), "niche must be escaped");
  assert.ok(!html.includes("<img src=x"), "factor reasons must be escaped");
  assert.ok(!html.includes("javascript:"), "non-http link must be dropped");
  assert.ok(html.includes('href="https://ok.example/x"'));
  assert.ok(html.includes("Weak signal"));
});
