// Offline unit tests against the built library (run `npm run build` first).
import { test } from "node:test";
import assert from "node:assert/strict";

// Tests must not read or write the user's real cache (the cache is created lazily, on first use).
process.env.GAPSCOUT_NO_CACHE = "1";
import {
  assertPublicUrl,
  decodeEntities,
  isPrivateIp,
  expandSeed,
  fetchPage,
  demandScore,
  extractThemes,
  opportunityScore,
  painHint,
  normalizeForMatch,
  relevantToNiche,
  renderReport,
  robotsAllows,
  robotsMatch,
  verifyQuote,
  serpWeakness,
} from "../dist/core.mjs";

test("painHint: multilingual, wtp weighs more", () => {
  const fr = painHint("Franchement la facturation c'est la galère, je paierais pour un outil", "fr");
  assert.ok(fr.score > 0.5, `fr score ${fr.score}`);
  assert.ok(fr.terms.includes("galère"));
  assert.ok(fr.terms.includes("je paierais"));
  assert.equal(painHint("Nice weather today", "en").score, 0);
  // code-switching: French target, English complaint still counts
  assert.ok(painHint("so frustrating, is there a tool for this?", "fr").score > 0);
});

test("demand: volumes vs autocomplete proxy", () => {
  assert.equal(demandScore(["a", "b"], { a: 3000, b: 2500 }).value, 5);
  assert.equal(demandScore(["a"], { a: 10 }).value, 1);
  const proxy = demandScore(Array.from({ length: 12 }, (_, i) => `kw ${i}`));
  assert.equal(proxy.value, 4);
  assert.match(proxy.why, /proxy/);
});

test("serpWeakness: forums in top 3 = weak, authority = strong", () => {
  const weak = serpWeakness("calcul urssaf freelance", [
    { position: 1, url: "https://www.reddit.com/r/vosfinances/comments/x", title: "Calcul urssaf freelance ?" },
    { position: 2, url: "https://forum.lesechos.fr/t/123", title: "urssaf freelance" },
    { position: 3, url: "https://www.quora.com/q", title: "Comment calculer" },
    { position: 4, url: "https://blog.example.com/urssaf", title: "Calcul urssaf freelance" },
  ]);
  const strong = serpWeakness("calcul urssaf freelance", [
    { position: 1, url: "https://www.urssaf.gouv.fr/x", title: "Calcul urssaf freelance" },
    { position: 2, url: "https://www.service-public.fr/y", title: "Calcul urssaf freelance" },
    { position: 3, url: "https://fr.wikipedia.org/z", title: "Calcul urssaf freelance" },
  ]);
  assert.ok(weak.score.value >= 4, `weak=${weak.score.value}`);
  assert.equal(strong.score.value, 1);
  assert.equal(serpWeakness("x", []).score.value, 3);
  // Citizen complaint pages on a .gouv.fr host are UGC, not authority.
  const complaints = serpWeakness("urssaf bug declaration", [1, 2, 3].map((p) => ({
    position: p, url: `https://www.plus.transformation.gouv.fr/experiences/${p}_site-urssaf`, title: `Site urssaf en panne ${p}`,
  })));
  assert.ok(complaints.score.value >= 4, `complaints=${complaints.score.value}`);
});

test("opportunity score: product and /100", () => {
  const s = (v) => ({ value: v, why: "" });
  assert.deepEqual(opportunityScore(s(5), s(5), s(5), s(5)), { product: 625, outOf100: 100 });
  assert.deepEqual(opportunityScore(s(1), s(1), s(1), s(1)), { product: 1, outOf100: 0 });
  assert.deepEqual(opportunityScore(s(3), s(3), s(3), s(3)), { product: 81, outOf100: 50 });
  assert.deepEqual(opportunityScore(s(4), s(3), s(3), s(4)), { product: 144, outOf100: 62 });
});

test("themes need two containers (not one app's name)", () => {
  const mk = (id, source, title, text) => ({ id, source, url: "u", title, text, painHint: 0.5 });
  const items = [
    mk("as:fr:1:a", "appstore", "[Indy · 1★] nul", "relance facture impayée impossible"),
    mk("as:fr:1:b", "appstore", "[Indy · 1★] bof", "support indy factures lent"),
    mk("as:fr:1:c", "appstore", "[Indy · 2★] bof", "indy factures plante"),
    mk("hn:9", "hn", "Ask HN", "la relance facture impayée me prend des heures"),
  ];
  const themes = extractThemes(items, "fr", ["comptabilité"]);
  const phrases = themes.map((t) => t.phrase);
  assert.ok(phrases.some((p) => p.includes("relance facture")), phrases.join(" | "));
  assert.ok(!phrases.includes("indy factures"), phrases.join(" | "));
});

test("relevantToNiche: accent-insensitive stems, app reviews always kept", () => {
  const mk = (source, text) => ({ id: "x", source, url: "u", text });
  assert.ok(relevantToNiche(mk("hn", "Ma comptabilite de freelance est un enfer"), "comptabilité freelance"));
  assert.ok(!relevantToNiche(mk("github", "Data Engineer job offers in Paris"), "comptabilité freelance"));
  assert.ok(relevantToNiche(mk("appstore", "app plante"), "comptabilité freelance"));
});

test("robots.txt patterns: wildcards and end anchors", () => {
  assert.ok(robotsMatch("/admin/", "/admin/x"));
  assert.ok(!robotsMatch("/*/media/oembed", "/experiences/123_page"));
  assert.ok(robotsMatch("/*/media/oembed", "/fr/media/oembed?u=1"));
  assert.ok(robotsMatch("/*?keywords=*", "/forum?keywords=tva"));
  assert.ok(robotsMatch("/core/*.css$", "/core/a/b.css"));
  assert.ok(!robotsMatch("/core/*.css$", "/core/a/b.css?v=2"));
  assert.ok(robotsMatch("/", "/anything"));
});

test("decodeEntities: named accents, numeric, hex", () => {
  assert.equal(decodeEntities("d&eacute;clar&eacute; &agrave; l&rsquo;URSSAF &ccedil;a &#233;t&#xE9; &hellip; &amp; co"), "déclaré à l’URSSAF ça été … & co");
  assert.equal(decodeEntities("&Uuml;bersicht &szlig; &ntilde; &unknown;"), "Übersicht ß ñ &unknown;");
  assert.equal(decodeEntities("d&amp;eacute;clar&amp;eacute; &amp;amp; co"), "déclaré & co", "double-encoded");
});

test("normalizeForMatch: accents, quotes, punctuation", () => {
  assert.equal(normalizeForMatch("L’URSSAF « plante » encore…"), "l'urssaf \" plante \" encore...".replace(/[^\p{L}\p{N}'"]+/gu, " ").trim());
});

test("renderReport: sorted, localized, quotes and links kept", () => {
  const s = (v, why = "r") => ({ value: v, why });
  const md = renderReport({
    niche: "comptabilité freelance",
    lang: "fr",
    generatedAt: "2026-11-11T00:00:00Z",
    sourcesUsed: ["reddit (web search)", "hn"],
    opportunities: [
      { title: "Petit", problem: "p", evidence: [{ quote: "q1", url: "https://a", source: "hn" }], frequency: s(1), intensity: s(1), demand: s(1), serpWeakness: s(1), keywords: [], productIdea: "i" },
      { title: "Gros", problem: "p", evidence: [{ quote: "q2 | pipe", url: "https://b", source: "reddit" }], frequency: s(5), intensity: s(4), demand: s(3), serpWeakness: s(4), keywords: [{ keyword: "relance facture", volume: 1300 }], productIdea: "i" },
    ],
  });
  assert.match(md, /## 1\. Gros — score 73\/100/);
  assert.match(md, /Preuves/);
  assert.match(md, /\[reddit\]\(https:\/\/b\)/);
  assert.match(md, /`relance facture` \(1,300\/mo\)/);
  assert.equal(md.match(/Signal faible/g)?.length, 2, "both test opportunities have a single source");
  assert.ok(md.indexOf("Gros") < md.indexOf("Petit"));
});

test("expandSeed: total Autocomplete outage throws instead of scoring 'no demand'", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("blocked", { status: 400 });
  try {
    await assert.rejects(expandSeed("gapscout outage test seed", "fr", "fr", "quick"), /Autocomplete unavailable/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("SSRF guard: private, loopback and metadata addresses are refused", async () => {
  for (const ip of ["127.0.0.1", "10.0.0.5", "172.20.1.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"])
    assert.ok(isPrivateIp(ip), ip);
  for (const ip of ["1.1.1.1", "8.8.8.8", "172.32.0.1", "2606:4700:4700::1111"]) assert.ok(!isPrivateIp(ip), ip);
  for (const url of ["http://localhost:8080/x", "http://127.0.0.1/", "http://[::1]/", "http://169.254.169.254/latest/meta-data/", "file:///etc/passwd", "http://printer.local/"])
    await assert.rejects(assertPublicUrl(url), url);
  await assert.doesNotReject(assertPublicUrl("https://1.1.1.1/"));
});

// Serve canned pages without the network: 1.1.1.1 passes the public-address guard with no DNS lookup.
async function withPages(pages, fn) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const hit = pages[String(url)];
    if (!hit) return new Response("", { status: 404 });
    return new Response(hit.body, { status: 200, headers: { "content-type": hit.type ?? "text/html", ...hit.headers } });
  };
  try {
    return await fn();
  } finally {
    globalThis.fetch = realFetch;
  }
}

test("verifyQuote: exact, short, elided, close and invented quotes", async () => {
  const url = "https://1.1.1.1/vq-thread";
  const body = "<html><body><p>Ich habe gek&uuml;ndigt. Abo Falle!</p><p>Die App ist leider sehr langsam und stürzt dauernd ab.</p></body></html>";
  await withPages({ [url]: { body } }, async () => {
    assert.equal((await verifyQuote(url, "Die App ist leider sehr langsam")).status, "exact");
    assert.equal((await verifyQuote(url, "Abo Falle!")).status, "exact", "two-word quote");
    assert.equal((await verifyQuote(url, "Ich habe gekündigt")).status, "exact", "HTML entity in page");
    assert.equal((await verifyQuote(url, "Die App ist … stürzt dauernd ab")).status, "exact", "elided quote");
    assert.equal((await verifyQuote(url, "Die App ist leider sehr langsam und stürzt ständig ab, furchtbar")).status, "close");
    assert.equal((await verifyQuote(url, "Der Support hat nie geantwortet und mein Geld ist weg")).status, "not_found");
    assert.equal((await verifyQuote(url, "Geld weg")).status, "not_found", "short invented quote");
  });
});

test("robotsAllows: only the groups for * or gapscout apply", async () => {
  const robots = "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /private/\nAllow: /private/open\n";
  await withPages({ "https://8.8.8.8/robots.txt": { body: robots, type: "text/plain" } }, async () => {
    assert.ok(await robotsAllows("https://8.8.8.8/forum/thread-1"), "GPTBot's Disallow: / must not apply to us");
    assert.ok(!(await robotsAllows("https://8.8.8.8/private/x")));
    assert.ok(await robotsAllows("https://8.8.8.8/private/open/page"), "longer Allow wins");
  });
});

test("fetchPage: refuses binary and oversized bodies", async () => {
  await withPages(
    {
      "https://1.1.1.1/big.html": { body: "x".repeat(5_000_001) },
      "https://1.1.1.1/file.zip": { body: "PK", type: "application/zip" },
    },
    async () => {
      await assert.rejects(fetchPage("https://1.1.1.1/big.html"), /larger than 5 MB/);
      await assert.rejects(fetchPage("https://1.1.1.1/file.zip"), /Not a text page/);
    },
  );
});

test("serpWeakness: app-store listings are thin results, not authority", () => {
  const r = serpWeakness("invoice app freelancers", [
    { position: 1, url: "https://apps.apple.com/us/app/x/id1", title: "Invoice app for freelancers" },
    { position: 2, url: "https://play.google.com/store/apps/details?id=x", title: "Invoice app for freelancers" },
  ]);
  assert.ok(r.signals.every((s) => s.includes("app-store listing")), r.signals.join(" | "));
});

test("renderReport: zero opportunities still renders, with the warning", () => {
  const md = renderReport({ niche: "x", lang: "en", generatedAt: "2026-11-12T00:00:00Z", sourcesUsed: ["hn"], opportunities: [], discarded: [{ title: "A", reason: "solved" }] });
  assert.match(md, /No strong opportunity/);
  assert.match(md, /\*\*A\*\* — solved/);
});
