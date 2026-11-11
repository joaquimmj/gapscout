#!/usr/bin/env node
import { createRequire as __gsCreateRequire } from 'node:module'; const require = __gsCreateRequire(import.meta.url);

// packages/cli/src/index.ts
import { mkdirSync as mkdirSync2, readFileSync, writeFileSync } from "node:fs";
import { join as join2 } from "node:path";
import { parseArgs } from "node:util";

// packages/core/src/types.ts
var SOURCE_IDS = ["hn", "stackexchange", "github", "appstore", "bluesky", "discourse", "reddit"];

// packages/core/src/i18n.ts
var EN = {
  pain: [
    "frustrat",
    "annoying",
    "annoyed",
    "i hate",
    "hate how",
    "pain in the",
    "nightmare",
    "tedious",
    "waste of time",
    "wasting hours",
    "so slow",
    "doesn't work",
    "does not work",
    "broken",
    "buggy",
    "struggl",
    "can't figure",
    "cannot figure",
    "confusing",
    "too expensive",
    "overpriced",
    "ridiculous",
    "drives me crazy",
    "sick of",
    "tired of",
    "fed up",
    "manually",
    "by hand",
    "spreadsheet hell",
    "workaround",
    "hacky",
    "no good way",
    "there's no way",
    "impossible to",
    "terrible",
    "awful",
    "worst"
  ],
  wtp: [
    "would pay",
    "i'd pay",
    "happy to pay",
    "shut up and take my money",
    "is there a tool",
    "is there an app",
    "any alternative",
    "alternative to",
    "looking for a tool",
    "looking for software",
    "recommend a tool",
    "switching from",
    "cancelled my subscription",
    "canceled my subscription"
  ],
  complaintQueries: [
    "{q}",
    "{q} frustrating",
    "{q} problem",
    "{q} alternative",
    "{q} is there a tool",
    "hate {q}"
  ],
  questionPrefixes: ["how to", "why is", "how do i", "best way to", "can't"],
  problemSuffixes: ["problem", "not working", "alternative", "too expensive", "tool", "software", "app", "template", "vs"],
  stopwords: "a an the and or but if of to in on for with at by from is are was were be been being it its this that these those i you he she we they my your our their me him her us them not no do does did have has had can could would should will just so very really about as into than then there here what which who when where why how all any some more most other such only own same too also get got like one also even much many".split(" "),
  country: "us"
};
var FR = {
  pain: [
    "gal\xE8re",
    "galere",
    "j'en ai marre",
    "marre de",
    "ras le bol",
    "ras-le-bol",
    "\xE9nervant",
    "enervant",
    "aga\xE7ant",
    "frustrant",
    "cauchemar",
    "perte de temps",
    "je perds",
    "trop cher",
    "hors de prix",
    "ne marche pas",
    "marche pas",
    "fonctionne pas",
    "bug",
    "plant\xE9",
    "lent",
    "impossible de",
    "compliqu\xE9",
    "prise de t\xEAte",
    "usine \xE0 gaz",
    "\xE0 la main",
    "manuellement",
    "fichier excel",
    "aucune solution",
    "pas de solution",
    "nul",
    "horrible",
    "le pire",
    "je d\xE9teste",
    "insupportable"
  ],
  wtp: [
    "je paierais",
    "pr\xEAt \xE0 payer",
    "pret a payer",
    "existe-t-il un outil",
    "existe t il",
    "un outil pour",
    "une appli pour",
    "une application pour",
    "alternative \xE0",
    "alternative a",
    "vous utilisez quoi",
    "quel logiciel",
    "quel outil",
    "je cherche un outil",
    "je cherche un logiciel",
    "r\xE9sili\xE9",
    "j'ai r\xE9sili\xE9"
  ],
  complaintQueries: [
    "{q}",
    "{q} gal\xE8re",
    "{q} probl\xE8me",
    "{q} alternative",
    "{q} quel outil",
    "{q} marre"
  ],
  questionPrefixes: ["comment", "pourquoi", "comment faire", "quel logiciel", "quel outil"],
  problemSuffixes: ["probl\xE8me", "ne marche pas", "alternative", "trop cher", "outil", "logiciel", "application", "mod\xE8le", "gratuit"],
  stopwords: "le la les un une des du de d l et ou mais si \xE0 a au aux en dans sur pour par avec sans ce cet cette ces c \xE7a ca est sont \xE9t\xE9 \xEAtre je tu il elle on nous vous ils elles me te se mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs ne pas plus qui que quoi dont o\xF9 ou y tr\xE8s tout tous toute toutes comme aussi fait faire avoir ai as avons avez ont j n s qu m\xEAme bien peu".split(" "),
  country: "fr"
};
var DE = {
  pain: [
    "nervig",
    "nervt",
    "frustrierend",
    "frustriert",
    "\xE4rgerlich",
    "albtraum",
    "zeitverschwendung",
    "zu teuer",
    "\xFCberteuert",
    "funktioniert nicht",
    "geht nicht",
    "kaputt",
    "fehlerhaft",
    "langsam",
    "kompliziert",
    "umst\xE4ndlich",
    "von hand",
    "manuell",
    "excel-tabelle",
    "keine l\xF6sung",
    "unm\xF6glich",
    "schrecklich",
    "furchtbar",
    "hasse",
    "ich hasse",
    "keine ahnung wie"
  ],
  wtp: [
    "w\xFCrde zahlen",
    "w\xFCrde bezahlen",
    "gibt es ein tool",
    "gibt es eine app",
    "gibt es eine software",
    "alternative zu",
    "suche ein tool",
    "suche eine software",
    "welche software",
    "welches tool",
    "gek\xFCndigt"
  ],
  complaintQueries: ["{q}", "{q} problem", "{q} alternative", "{q} nervig", "{q} welches tool"],
  questionPrefixes: ["wie", "warum", "wie kann ich", "welche software", "welches tool"],
  problemSuffixes: ["problem", "funktioniert nicht", "alternative", "zu teuer", "tool", "software", "app", "vorlage", "kostenlos"],
  stopwords: "der die das ein eine einer eines einem einen und oder aber wenn von zu im in an auf f\xFCr mit bei aus ist sind war waren sein es dies diese dieser ich du er sie wir ihr mein dein unser euer nicht kein keine ja nein wie was wer wann wo warum auch noch nur schon sehr mehr man sich mich mir dich dir uns".split(" "),
  country: "de"
};
var ES = {
  pain: [
    "frustrante",
    "molesto",
    "me molesta",
    "pesadilla",
    "p\xE9rdida de tiempo",
    "perdida de tiempo",
    "demasiado caro",
    "car\xEDsimo",
    "no funciona",
    "no sirve",
    "roto",
    "lento",
    "complicado",
    "un l\xEDo",
    "a mano",
    "manualmente",
    "hoja de c\xE1lculo",
    "no hay soluci\xF3n",
    "imposible",
    "horrible",
    "lo peor",
    "odio",
    "harto de",
    "harta de",
    "estoy harto"
  ],
  wtp: [
    "pagar\xEDa",
    "pagaria",
    "hay alguna herramienta",
    "hay alguna app",
    "alguna alternativa",
    "alternativa a",
    "busco una herramienta",
    "busco un programa",
    "qu\xE9 programa",
    "que programa",
    "qu\xE9 herramienta",
    "cancel\xE9"
  ],
  complaintQueries: ["{q}", "{q} problema", "{q} alternativa", "{q} qu\xE9 herramienta", "{q} harto"],
  questionPrefixes: ["c\xF3mo", "por qu\xE9", "c\xF3mo hacer", "qu\xE9 programa", "qu\xE9 herramienta"],
  problemSuffixes: ["problema", "no funciona", "alternativa", "caro", "herramienta", "programa", "app", "plantilla", "gratis"],
  stopwords: "el la los las un una unos unas y o pero si de del a al en con sin por para es son fue ser estar est\xE1 este esta estos estas ese esa eso yo tu \xE9l ella nosotros vosotros ellos mi mis tu tus su sus nuestro no s\xED que qu\xE9 quien c\xF3mo como cuando donde muy m\xE1s tambi\xE9n ya solo me te se lo le les nos".split(" "),
  country: "es"
};
var LANG_PACKS = { en: EN, fr: FR, de: DE, es: ES };
function isLang(x) {
  return x in LANG_PACKS;
}
function painHint(text, lang) {
  const t = text.toLowerCase();
  const terms = /* @__PURE__ */ new Set();
  let score = 0;
  const packs = [LANG_PACKS[lang], ...Object.values(LANG_PACKS).filter((p) => p !== LANG_PACKS[lang])];
  for (const p of packs) {
    for (const w of p.pain) if (t.includes(w)) {
      terms.add(w);
      score += 1;
    }
    for (const w of p.wtp) if (t.includes(w)) {
      terms.add(w);
      score += 2;
    }
  }
  return { score: Math.round((1 - Math.exp(-score / 2.5)) * 100) / 100, terms: [...terms].slice(0, 8) };
}
function complaintQueries(niche, lang) {
  return LANG_PACKS[lang].complaintQueries.map((t) => t.replace("{q}", niche));
}

// packages/core/src/scoring.ts
function demandScore(relevant, volumes) {
  const kws = relevant.map((s) => (typeof s === "string" ? s : s.keyword).toLowerCase());
  if (volumes && Object.keys(volumes).length) {
    const total = kws.reduce((sum, k) => sum + (volumes[k] ?? 0), 0);
    const v2 = total >= 5e3 ? 5 : total >= 1e3 ? 4 : total >= 200 ? 3 : total >= 50 ? 2 : 1;
    return { value: v2, why: `${total.toLocaleString("en-US")} searches/month across ${kws.length} keyword(s) (Google Ads data)` };
  }
  const n = kws.length;
  const v = n >= 25 ? 5 : n >= 10 ? 4 : n >= 4 ? 3 : n >= 1 ? 2 : 1;
  return {
    value: v,
    why: `${n} related Google Autocomplete suggestion(s) \u2014 proxy for demand, no volumes (set DataForSEO keys for volumes)`
  };
}
var UGC = [
  /(^|\.)reddit\.com$/,
  /(^|\.)quora\.com$/,
  /(^|\.)stackexchange\.com$/,
  /(^|\.)stackoverflow\.com$/,
  /(^|\.)superuser\.com$/,
  /(^|\.)news\.ycombinator\.com$/,
  /(^|\.)medium\.com$/,
  /(^|\.)facebook\.com$/,
  /(^|\.)linkedin\.com$/,
  /(^|\.)youtube\.com$/,
  /(^|\.)tiktok\.com$/,
  /(^|\.)twitter\.com$/,
  /(^|\.)x\.com$/,
  /(^|\.)github\.com$/,
  /(^|\.)answers\./,
  /(^|\.)community\./,
  /(^|\.)forum\./,
  /^forum[a-z0-9-]*\./,
  /(^|\.)discourse\./,
  /(^|\.)bsky\.app$/,
  /(^|\.)commentcamarche\.net$/,
  /(^|\.)doctissimo\.fr$/,
  /(^|\.)gutefrage\.net$/,
  /(^|\.)forocoches\.com$/,
  // Public complaint / review pages: users describing the problem, not a solution.
  /(^|\.)plus\.transformation\.gouv\.fr$/,
  /(^|\.)trustpilot\.com$/,
  /(^|\.)avis-verifies\.com$/,
  /(^|\.)indiehackers\.com$/,
  /(^|\.)gutefrage\.net$/,
  /(^|\.)finanzfrage\.net$/
];
var THIN = [
  /(^|\.)apps\.apple\.com$/,
  /(^|\.)play\.google\.com$/,
  /(^|\.)alternativeto\.net$/,
  /(^|\.)jotform\.com$/,
  /(^|\.)canva\.com$/,
  /(^|\.)template\.net$/,
  // Software directories: they rank everywhere but are lists, not answers.
  /(^|\.)capterra\./,
  /(^|\.)getapp\./,
  /(^|\.)g2\.com$/,
  /(^|\.)softwareadvice\./,
  /(^|\.)trusted\.de$/,
  /(^|\.)omr\.com$/
];
var LISTICLE = /\b(meilleur|meilleurs|comparatif|top \d+|best|vs\.?|alternatives?|vergleich|besten|mejores|comparativa)\b/i;
var AUTHORITY = [
  /(^|\.)wikipedia\.org$/,
  /\.gov(\.[a-z]{2})?$/,
  /\.gouv\.fr$/,
  /(^|\.)service-public\.fr$/,
  /\.bund\.de$/,
  /\.gob\.es$/,
  /(^|\.)google\.com$/,
  /(^|\.)microsoft\.com$/,
  /(^|\.)apple\.com$/,
  /(^|\.)amazon\./
];
function host(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
function serpWeakness(query, results) {
  const top = results.slice(0, 10);
  if (!top.length) return { score: { value: 3, why: "no SERP data \u2014 neutral score" }, signals: [] };
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const signals = [];
  let points = 0;
  top.forEach((r, i) => {
    const h = host(r.url);
    if (UGC.some((re) => re.test(h))) {
      const w = i < 3 ? 2 : 1;
      points += w;
      signals.push(`#${r.position} is user-generated content (${h})${i < 3 ? " in the top 3" : ""}`);
    } else if (AUTHORITY.some((re) => re.test(h))) {
      points -= 1;
      signals.push(`#${r.position} is a high-authority site (${h})`);
    } else if (THIN.some((re) => re.test(h))) {
      points += 0.5;
      signals.push(`#${r.position} is an app-store listing or template gallery (${h}), not a dedicated page`);
    } else if (LISTICLE.test(r.title)) {
      points += 0.5;
      signals.push(`#${r.position} is a comparison/listicle page, not a dedicated solution ("${r.title.slice(0, 50)}")`);
    }
    if (terms.length && i < 5) {
      const title = r.title.toLowerCase();
      const matched = terms.filter((t) => title.includes(t)).length;
      if (matched / terms.length < 0.5) {
        points += 0.5;
        signals.push(`#${r.position} title barely matches the query ("${r.title.slice(0, 60)}")`);
      }
    }
  });
  const v = points >= 6 ? 5 : points >= 4 ? 4 : points >= 2 ? 3 : points >= 1 ? 2 : 1;
  const ugcCount = signals.filter((s) => s.includes("user-generated")).length;
  return {
    score: { value: v, why: `${ugcCount}/${top.length} results are forums/Q&A; weakness points ${points}` },
    signals
  };
}
function opportunityScore(f, i, d, s) {
  const product = f.value * i.value * d.value * s.value;
  const geo = Math.pow(product, 1 / 4);
  return { product, outOf100: Math.round((geo - 1) / 4 * 100) };
}

// packages/core/src/cache.ts
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
var MemoryCache = class {
  kind = "memory";
  m = /* @__PURE__ */ new Map();
  get(key) {
    const e = this.m.get(key);
    if (!e) return void 0;
    if (e.exp < Date.now()) {
      this.m.delete(key);
      return void 0;
    }
    return e.v;
  }
  set(key, value, ttlSeconds) {
    this.m.set(key, { v: value, exp: Date.now() + ttlSeconds * 1e3 });
  }
};
var SqliteCache = class {
  // Keep `db` referenced: on Node 22 a collected DatabaseSync finalizes its statements.
  constructor(db, path) {
    this.db = db;
    this.path = path;
    db.exec(
      "CREATE TABLE IF NOT EXISTS cache (k TEXT PRIMARY KEY, v TEXT NOT NULL, exp INTEGER NOT NULL)"
    );
    db.exec(`DELETE FROM cache WHERE exp < ${Date.now()}`);
    this.getStmt = db.prepare("SELECT v, exp FROM cache WHERE k = ?");
    this.setStmt = db.prepare("INSERT OR REPLACE INTO cache (k, v, exp) VALUES (?, ?, ?)");
  }
  kind = "sqlite";
  getStmt;
  setStmt;
  get(key) {
    const row = this.getStmt.get(key);
    if (!row || row.exp < Date.now()) return void 0;
    return JSON.parse(row.v);
  }
  set(key, value, ttlSeconds) {
    this.setStmt.run(key, JSON.stringify(value), Date.now() + ttlSeconds * 1e3);
  }
};
var instance;
function getCache() {
  if (instance) return instance;
  if (process.env.GAPSCOUT_NO_CACHE === "1") return instance = new MemoryCache();
  const dir = process.env.GAPSCOUT_CACHE_DIR ?? join(homedir(), ".cache", "gapscout");
  try {
    mkdirSync(dir, { recursive: true });
    const origEmit = process.emitWarning;
    process.emitWarning = ((w, ...rest2) => {
      const msg = typeof w === "string" ? w : w.message;
      if (msg.includes("SQLite")) return;
      return origEmit.call(process, w, ...rest2);
    });
    const require2 = createRequire(import.meta.url);
    const { DatabaseSync } = require2("node:sqlite");
    process.emitWarning = origEmit;
    const path = join(dir, "cache.db");
    instance = new SqliteCache(new DatabaseSync(path), path);
  } catch {
    instance = new MemoryCache();
  }
  return instance;
}

// packages/core/src/http.ts
var USER_AGENT = "gapscout/0.1 (+https://github.com/joaquimmj/gapscout)";
var HttpError = class extends Error {
  constructor(status, url, body) {
    super(`HTTP ${status} for ${redact(url)}: ${body.slice(0, 200)}`);
    this.status = status;
    this.url = url;
    this.body = body;
  }
};
function redact(url) {
  return url.replace(/([?&](key|access_token|token)=)[^&]+/gi, "$1***");
}
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchJson(url, opts = {}) {
  const ttl = opts.ttl ?? 6 * 3600;
  const cacheKey = `${opts.method ?? "GET"} ${url} ${opts.body ? JSON.stringify(opts.body) : ""}`;
  const cache = getCache();
  if (ttl > 0) {
    const hit = cache.get(cacheKey);
    if (hit !== void 0) return hit;
  }
  const retries = opts.retries ?? 2;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
          ...opts.body ? { "Content-Type": "application/json" } : {},
          ...opts.headers
        },
        body: opts.body ? JSON.stringify(opts.body) : void 0,
        redirect: opts.redirect,
        signal: AbortSignal.timeout(opts.timeoutMs ?? 2e4)
      });
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get("retry-after")) || 2 ** attempt;
        lastErr = new HttpError(res.status, url, await res.text());
        if (attempt < retries) {
          await sleep(Math.min(retryAfter, 10) * 1e3);
          continue;
        }
        throw lastErr;
      }
      if (!res.ok) throw new HttpError(res.status, url, await res.text());
      const data = await res.json();
      if (ttl > 0) cache.set(cacheKey, data, ttl);
      return data;
    } catch (e) {
      lastErr = e;
      if (e instanceof HttpError && e.status < 500 && e.status !== 429) throw e;
      if (attempt < retries) await sleep(500 * 2 ** attempt);
    }
  }
  throw lastErr;
}
function truncate(s, max) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "\u2026";
}
var NAMED = {
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201D",
  ldquo: "\u201C",
  laquo: "\xAB",
  raquo: "\xBB",
  hellip: "\u2026",
  ndash: "\u2013",
  mdash: "\u2014",
  euro: "\u20AC",
  oelig: "\u0153",
  OElig: "\u0152",
  szlig: "\xDF",
  deg: "\xB0",
  copy: "\xA9",
  reg: "\xAE",
  middot: "\xB7",
  bull: "\u2022",
  iexcl: "\xA1",
  iquest: "\xBF",
  shy: ""
};
var ACCENTS = { acute: "\u0301", grave: "\u0300", circ: "\u0302", uml: "\u0308", tilde: "\u0303", cedil: "\u0327", ring: "\u030A" };
function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    if (e in NAMED) return NAMED[e];
    const acc = /^([a-z])(acute|grave|circ|uml|tilde|cedil|ring)$/i.exec(e);
    if (acc) return (acc[1] + ACCENTS[acc[2]]).normalize("NFC");
    if (e === "amp") return "&";
    return m;
  });
}
function htmlToText(html) {
  return decodeEntities(
    html.replace(/<(br|p|\/p|li|\/li|div|\/div|h\d|\/h\d|tr|blockquote)[^>]*>/gi, "\n").replace(/<[^>]+>/g, "")
  ).replace(/\n{3,}/g, "\n\n").trim();
}
function daysAgoUnix(days) {
  return Math.floor(Date.now() / 1e3) - days * 86400;
}

// packages/core/src/demand/autocomplete.ts
var ENDPOINT = "https://suggestqueries.google.com/complete/search";
async function suggest(q, lang, country) {
  const params = new URLSearchParams({ client: "firefox", q, hl: lang, gl: country });
  const data = await fetchJson(`${ENDPOINT}?${params}`, { ttl: 3 * 86400 });
  return Array.isArray(data?.[1]) ? data[1] : [];
}
var sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
async function expandSeed(seed, lang, country, depth = "normal") {
  const pack = LANG_PACKS[lang];
  const prefixes = depth === "quick" ? pack.questionPrefixes.slice(0, 2) : pack.questionPrefixes;
  const suffixes = depth === "quick" ? pack.problemSuffixes.slice(0, 5) : pack.problemSuffixes;
  const probes = [seed, ...prefixes.map((p) => `${p} ${seed}`), ...suffixes.map((s) => `${seed} ${s}`)];
  if (depth === "deep") for (const c of "abcdefghijklmnopqrstuvwxyz") probes.push(`${seed} ${c}`);
  const seen = /* @__PURE__ */ new Map();
  let failures = 0;
  let lastError;
  for (const probe of probes) {
    try {
      for (const kw of await suggest(probe, lang, country)) {
        const k = kw.toLowerCase().trim();
        if (!seen.has(k)) seen.set(k, { keyword: k, from: probe });
      }
    } catch (e) {
      failures++;
      lastError = e;
    }
    await sleep2(120);
  }
  if (failures === probes.length) throw new Error(`Google Autocomplete unavailable: ${lastError?.message ?? lastError}`);
  return [...seen.values()];
}

// packages/core/src/demand/dataforseo.ts
var BASE = "https://api.dataforseo.com/v3";
var LOCATION_CODES = {
  us: 2840,
  gb: 2826,
  ca: 2124,
  au: 2036,
  fr: 2250,
  be: 2056,
  ch: 2756,
  de: 2276,
  at: 2040,
  es: 2724,
  mx: 2484
};
function hasDataForSEO() {
  return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}
function auth() {
  const token = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}
async function post(path, body) {
  const data = await fetchJson(`${BASE}${path}`, {
    method: "POST",
    headers: auth(),
    body,
    ttl: 7 * 86400,
    // paid calls: cache for a week
    timeoutMs: 6e4
  });
  const task = data.tasks?.[0];
  if (data.status_code !== 2e4 || !task || task.status_code !== 2e4)
    throw new Error(`DataForSEO: ${task?.status_message ?? data.status_message}`);
  return task.result ?? [];
}
function location(country) {
  const code = LOCATION_CODES[country.toLowerCase()];
  if (!code) throw new Error(`DataForSEO: no location code for country "${country}". Known: ${Object.keys(LOCATION_CODES).join(", ")}`);
  return code;
}
async function searchVolumes(keywords, lang, country) {
  const uniq = [...new Set(keywords.map((k) => k.toLowerCase().trim()))].filter(Boolean).slice(0, 1e3);
  if (!uniq.length) return {};
  const rows = await post(
    "/keywords_data/google_ads/search_volume/live",
    [{ keywords: uniq, language_code: lang, location_code: location(country) }]
  );
  const out = {};
  for (const r of rows) out[r.keyword] = r.search_volume;
  return out;
}
async function serpTop(query, lang, country, depth = 10) {
  const rows = await post(
    "/serp/google/organic/live/regular",
    [{ keyword: query, language_code: lang, location_code: location(country), depth }]
  );
  return (rows[0]?.items ?? []).filter((i) => i.type === "organic").map((i, idx) => ({ position: idx + 1, url: i.url, title: i.title, snippet: i.description }));
}

// packages/core/src/sources/appstore.ts
async function searchAppStore(query, opts) {
  const country = (opts.country ?? LANG_PACKS[opts.lang].country).toLowerCase();
  const maxRating = opts.maxRating ?? 3;
  const appsWanted = opts.apps ?? 5;
  const search = await fetchJson(
    `https://itunes.apple.com/search?${new URLSearchParams({
      term: query,
      entity: "software",
      country,
      limit: String(appsWanted)
    })}`
  );
  const items = [];
  const notes = [];
  const since = opts.sinceDays ? Date.now() - opts.sinceDays * 864e5 : 0;
  for (const app of search.results) {
    try {
      const feed = await fetchJson(
        `https://itunes.apple.com/${country}/rss/customerreviews/page=1/id=${app.trackId}/sortby=mostrecent/json`
      );
      const raw = feed.feed?.entry;
      const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
      let kept = 0;
      for (const e of entries) {
        const rating = Number(e["im:rating"]?.label);
        if (!rating || rating > maxRating) continue;
        const updated = e.updated?.label;
        if (since && updated && Date.parse(updated) < since) continue;
        kept++;
        items.push({
          id: `as:${country}:${app.trackId}:${e.id?.label ?? kept}`,
          source: "appstore",
          url: app.trackViewUrl,
          title: `[${app.trackName} \xB7 ${rating}\u2605] ${e.title?.label ?? ""}`.trim(),
          text: e.content?.label ?? "",
          author: e.author?.name?.label,
          createdAt: updated,
          rating,
          engagement: Number(e["im:voteSum"]?.label) || void 0
        });
      }
      notes.push(`${app.trackName}: ${kept} reviews \u2264${maxRating}\u2605 of ${entries.length} recent (avg ${app.averageUserRating?.toFixed(1) ?? "?"}\u2605, ${app.userRatingCount ?? "?"} ratings)`);
    } catch (e) {
      notes.push(`${app.trackName}: ${e.message}`);
    }
  }
  if (!search.results.length) notes.push(`No App Store apps found for "${query}" in ${country.toUpperCase()}.`);
  return { source: "appstore", query, items: items.slice(0, opts.limit ?? 60), notes };
}

// packages/core/src/sources/bluesky.ts
var BASE2 = "https://api.bsky.app/xrpc";
function postUrl(p) {
  const rkey = p.uri.split("/").pop();
  return `https://bsky.app/profile/${p.author.handle}/post/${rkey}`;
}
async function searchBluesky(query, opts) {
  const params = new URLSearchParams({
    q: query,
    limit: String(Math.min(opts.limit ?? 25, 100)),
    sort: opts.sort ?? "top",
    lang: opts.lang
  });
  if (opts.sinceDays) params.set("since", new Date(Date.now() - opts.sinceDays * 864e5).toISOString());
  const data = await fetchJson(`${BASE2}/app.bsky.feed.searchPosts?${params}`, { ttl: 6 * 3600 });
  const items = data.posts.filter((p) => (p.record.text ?? "").length >= 40).map((p) => ({
    id: `bs:${p.uri.replace("at://", "")}`,
    source: "bluesky",
    url: postUrl(p),
    title: `@${p.author.handle}`,
    text: p.record.text ?? "",
    author: p.author.handle,
    createdAt: p.record.createdAt ?? p.indexedAt,
    engagement: (p.likeCount ?? 0) + (p.repostCount ?? 0) + (p.quoteCount ?? 0),
    comments: p.replyCount
  }));
  return {
    source: "bluesky",
    query,
    items,
    notes: [
      `${data.hitsTotal ?? items.length} Bluesky posts match (keyword search: expect noise, keep only first-person problems).`
    ]
  };
}
async function getBlueskyThread(id) {
  const uri = `at://${id}`;
  const data = await fetchJson(
    `${BASE2}/app.bsky.feed.getPostThread?${new URLSearchParams({ uri, depth: "3" })}`
  );
  const root = data.thread.post;
  if (!root) throw new Error(`Bluesky post not found: ${uri}`);
  const replies = [];
  const walk = (nodes) => {
    for (const n of nodes ?? []) {
      if (n.post?.record.text)
        replies.push({
          author: n.post.author.handle,
          text: n.post.record.text,
          engagement: n.post.likeCount,
          createdAt: n.post.record.createdAt
        });
      walk(n.replies);
    }
  };
  walk(data.thread.replies);
  return { id: `bs:${id}`, source: "bluesky", url: postUrl(root), title: `@${root.author.handle}`, text: root.record.text ?? "", replies };
}

// packages/core/src/page.ts
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
var NEVER = [/(^|\.)reddit\.com$/i, /(^|\.)redd\.it$/i];
function isPrivateIp(ip) {
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (isIP(v4) === 4) {
    const [a, b] = v4.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127;
  }
  const x = ip.toLowerCase();
  return x === "::" || x === "::1" || /^f[cd]/.test(x) || /^fe[89ab]/.test(x) || x.startsWith("ff");
}
async function assertPublicUrl(url) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) URLs.");
  const host2 = u.hostname.replace(/^\[|\]$/g, "");
  if (/^localhost$|\.localhost$|\.local$|\.internal$/i.test(host2)) throw new Error(`Refusing non-public host ${host2}.`);
  const addrs = isIP(host2) ? [host2] : (await lookup(host2, { all: true })).map((a) => a.address);
  if (!addrs.length || addrs.some(isPrivateIp)) throw new Error(`Refusing non-public address for ${host2}.`);
  return u;
}
async function getText(url, timeoutMs = 15e3) {
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicUrl(url);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,text/plain;q=0.9,*/*;q=0.5" },
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs)
    });
    const next = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!next) return { status: res.status, body: await res.text(), type: res.headers.get("content-type") ?? "" };
    url = new URL(next, url).toString();
  }
  throw new Error("Too many redirects.");
}
async function robotsAllows(url) {
  const u = new URL(url);
  const cache = getCache();
  const key = `robots ${u.origin}`;
  let rules = cache.get(key);
  if (!rules) {
    rules = { allow: [], disallow: [] };
    try {
      const { status, body } = await getText(`${u.origin}/robots.txt`, 8e3);
      if (status === 200) {
        let applies = false;
        let sawAgentInGroup = false;
        for (const raw of body.split(/\r?\n/)) {
          const line = raw.replace(/#.*/, "").trim();
          const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
          if (!m) continue;
          const field = m[1].toLowerCase();
          const value = m[2].trim();
          if (field === "user-agent") {
            if (!sawAgentInGroup) applies = false;
            sawAgentInGroup = true;
            if (value === "*" || value.toLowerCase().includes("gapscout")) applies = true;
          } else {
            sawAgentInGroup = false;
            if (!applies) continue;
            if (field === "disallow" && value) rules.disallow.push(value);
            if (field === "allow" && value) rules.allow.push(value);
          }
        }
      }
    } catch {
    }
    cache.set(key, rules, 86400);
  }
  const path = u.pathname + u.search;
  const longest = (list) => Math.max(-1, ...list.filter((p) => robotsMatch(p, path)).map((p) => p.length));
  return longest(rules.allow) >= longest(rules.disallow);
}
function robotsMatch(pattern, path) {
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const re = new RegExp("^" + body.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + (anchored ? "$" : ""));
  return re.test(path);
}
async function fetchPage(url) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) URLs.");
  if (NEVER.some((re) => re.test(u.hostname)))
    throw new Error("gapscout never fetches reddit.com. Use Reddit search snippets (DataForSEO) instead.");
  if (!await robotsAllows(url)) throw new Error(`robots.txt of ${u.hostname} disallows this page for crawlers; not fetched.`);
  const cache = getCache();
  const hit = cache.get(`page ${url}`);
  if (hit) return hit;
  const { status, body, type } = await getText(url);
  if (status >= 400) throw new Error(`HTTP ${status} for ${url}`);
  const isHtml = /html|xml/.test(type) || /^\s*</.test(body);
  const title = isHtml ? /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1]?.trim() : void 0;
  const text = isHtml ? htmlToText(
    body.replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ")
  ).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n") : body;
  const page = { url, status, title: title ? htmlToText(title) : void 0, text };
  cache.set(`page ${url}`, page, 86400);
  return page;
}
function normalizeForMatch(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’‘`´]/g, "'").replace(/[“”«»„]/g, '"').replace(/[…]/g, "...").replace(/[^\p{L}\p{N}'"]+/gu, " ").trim();
}
async function verifyQuote(url, quote) {
  let page;
  try {
    page = await fetchPage(url);
  } catch (e) {
    return { url, status: "unreachable", error: e.message };
  }
  const hay = normalizeForMatch(page.text);
  const fragments = quote.split(/\.\.\.|…|\[\.\.\.\]/).map(normalizeForMatch).filter((f) => f.split(" ").length >= 3);
  if (fragments.length && fragments.every((f) => hay.includes(f))) {
    return { url, status: "exact", overlap: 1, excerpt: excerptAround(page.text, quote) };
  }
  const words = normalizeForMatch(quote).split(" ");
  const grams = [];
  for (let i = 0; i + 4 <= words.length; i++) grams.push(words.slice(i, i + 4).join(" "));
  const overlap = grams.length ? grams.filter((g) => hay.includes(g)).length / grams.length : 0;
  return {
    url,
    status: overlap >= 0.6 ? "close" : "not_found",
    overlap: Math.round(overlap * 100) / 100,
    excerpt: overlap >= 0.3 ? excerptAround(page.text, quote) : void 0
  };
}
function excerptAround(text, quote) {
  const words = quote.split(/\s+/).filter((w) => w.length > 3);
  for (let i = 0; i + 3 <= words.length; i++) {
    const probe = words.slice(i, i + 3).join(" ");
    const idx = text.toLowerCase().indexOf(probe.toLowerCase());
    if (idx >= 0) return truncate(text.slice(Math.max(0, idx - 40), idx + 300).replace(/\s+/g, " ").trim(), 340);
  }
  return void 0;
}

// packages/core/src/sources/discourse.ts
function clean(domain) {
  return domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
}
async function searchDiscourse(query, opts) {
  const items = [];
  const notes = [];
  if (!opts.domains.length) return { source: "discourse", query, items, notes: ["No Discourse domains given (pass discourse_domains)."] };
  const perForum = Math.max(5, Math.ceil((opts.limit ?? 25) / opts.domains.length));
  for (const raw of opts.domains) {
    const domain = clean(raw);
    try {
      const url = `https://${domain}/search.json?${new URLSearchParams({ q: query })}`;
      await assertPublicUrl(url);
      if (!await robotsAllows(url)) {
        notes.push(`${domain}: robots.txt disallows search; skipped.`);
        continue;
      }
      const data = await fetchJson(url, { retries: 1, redirect: "error" });
      const topics = new Map((data.topics ?? []).map((t) => [t.id, t]));
      const since = opts.sinceDays ? Date.now() - opts.sinceDays * 864e5 : 0;
      let n = 0;
      for (const p of data.posts ?? []) {
        if (n >= perForum) break;
        if (since && p.created_at && Date.parse(p.created_at) < since) continue;
        const t = topics.get(p.topic_id);
        n++;
        items.push({
          id: `dc:${domain}:${p.topic_id}:${p.post_number}`,
          source: "discourse",
          url: `https://${domain}/t/${t?.slug ?? "-"}/${p.topic_id}/${p.post_number}`,
          title: `[${domain}] ${t?.title ?? ""}`,
          text: htmlToText(p.blurb ?? ""),
          author: p.username,
          createdAt: p.created_at,
          engagement: p.like_count,
          comments: t?.posts_count
        });
      }
      notes.push(`${domain}: ${n} posts`);
    } catch (e) {
      notes.push(`${domain}: not a reachable Discourse forum (${e.message.slice(0, 80)})`);
    }
  }
  notes.push("Discourse search returns excerpts: open the topic with get_thread before quoting.");
  return { source: "discourse", query, items, notes };
}
async function getDiscourseThread(id) {
  const [domain, topicId, postNumber] = id.split(":");
  if (!domain || !topicId) throw new Error(`Discourse id must look like "forum.example.com:123:4", got "${id}"`);
  const url = `https://${domain}/t/${topicId}.json`;
  await assertPublicUrl(url);
  if (!await robotsAllows(url)) throw new Error(`robots.txt of ${domain} disallows this topic.`);
  const data = await fetchJson(url, { redirect: "error" });
  const posts = data.post_stream.posts;
  const target = posts.find((p) => String(p.post_number) === postNumber) ?? posts[0];
  return {
    id: `dc:${id}`,
    source: "discourse",
    url: `https://${domain}/t/${data.slug}/${topicId}/${target?.post_number ?? 1}`,
    title: data.title,
    text: htmlToText(target?.cooked ?? ""),
    replies: posts.filter((p) => p !== target).map((p) => ({ author: p.username, text: htmlToText(p.cooked ?? ""), engagement: p.like_count, createdAt: p.created_at }))
  };
}

// packages/core/src/sources/github.ts
var BASE3 = "https://api.github.com";
function headers() {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...token ? { Authorization: `Bearer ${token}` } : {}
  };
}
async function searchGitHub(query, opts) {
  let q = `${query} is:issue`;
  if (opts.sinceDays) {
    const d = new Date(Date.now() - opts.sinceDays * 864e5).toISOString().slice(0, 10);
    q += ` created:>${d}`;
  }
  const params = new URLSearchParams({
    q,
    sort: "reactions",
    order: "desc",
    per_page: String(Math.min(opts.limit ?? 30, 100))
  });
  const data = await fetchJson(`${BASE3}/search/issues?${params}`, {
    headers: headers()
  });
  const items = data.items.map((i) => {
    const repo = i.repository_url.replace(`${BASE3}/repos/`, "");
    return {
      id: `gh:${repo}#${i.number}`,
      source: "github",
      url: i.html_url,
      title: `[${repo}] ${i.title}`,
      text: (i.body ?? "").replace(/<!--[\s\S]*?-->/g, "").trim(),
      author: i.user?.login,
      createdAt: i.created_at,
      engagement: i.reactions?.total_count,
      comments: i.comments
    };
  });
  const notes = [`${data.total_count} matching issues on GitHub`];
  if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN)
    notes.push("Tip: set GITHUB_TOKEN for higher search limits (10/min unauthenticated).");
  return { source: "github", query, items, notes };
}
async function getGitHubThread(id) {
  const m = /^([^/]+\/[^#]+)#(\d+)$/.exec(id);
  if (!m) throw new Error(`GitHub id must look like "owner/repo#123", got "${id}"`);
  const [, repo, num] = m;
  const issue = await fetchJson(`${BASE3}/repos/${repo}/issues/${num}`, { headers: headers() });
  const comments = await fetchJson(
    `${BASE3}/repos/${repo}/issues/${num}/comments?per_page=50`,
    { headers: headers() }
  );
  return {
    id: `gh:${id}`,
    source: "github",
    url: issue.html_url,
    title: issue.title,
    text: issue.body ?? "",
    replies: comments.map((c) => ({
      author: c.user?.login,
      text: c.body ?? "",
      engagement: c.reactions?.total_count,
      createdAt: c.created_at
    }))
  };
}

// packages/core/src/sources/hn.ts
var BASE4 = "https://hn.algolia.com/api/v1";
async function searchHN(query, opts) {
  const limit = Math.min(opts.limit ?? 30, 100);
  const params = new URLSearchParams({
    query,
    tags: "(story,comment,ask_hn)",
    hitsPerPage: String(limit)
  });
  if (opts.sinceDays) params.set("numericFilters", `created_at_i>${daysAgoUnix(opts.sinceDays)}`);
  const data = await fetchJson(`${BASE4}/search?${params}`);
  const HIRING = /who is hiring|who wants to be hired|seeking freelancer|freelancer\? seeking/i;
  const hits = data.hits.filter((h) => !HIRING.test(h.story_title ?? h.title ?? ""));
  const items = hits.map((h) => {
    const isComment = h._tags?.includes("comment");
    const text = htmlToText(h.comment_text ?? h.story_text ?? "");
    return {
      id: `hn:${h.objectID}`,
      source: "hn",
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
      title: (isComment ? h.story_title : h.title) ?? void 0,
      text: text || (h.title ?? ""),
      author: h.author,
      createdAt: h.created_at,
      engagement: h.points ?? void 0,
      comments: h.num_comments ?? void 0
    };
  });
  return { source: "hn", query, items, notes: [`${data.nbHits} total hits on HN`] };
}
async function getHNThread(id, maxReplies = 60) {
  let item = await fetchJson(`${BASE4}/items/${encodeURIComponent(id)}`);
  let title = item.title ?? void 0;
  let text = htmlToText(item.text ?? "");
  if (item.type === "comment" && item.story_id && String(item.story_id) !== id) {
    const story = await fetchJson(`${BASE4}/items/${item.story_id}`);
    title = story.title ?? void 0;
    text = `${text}

[in thread: ${story.title ?? ""}]${story.text ? `
${htmlToText(story.text)}` : ""}`;
    item = { ...story, children: (story.children ?? []).filter((c) => String(c.id) !== id) };
  }
  const replies = [];
  const walk = (nodes, depth) => {
    for (const n of nodes ?? []) {
      if (replies.length >= maxReplies) return;
      if (n.text) replies.push({ author: n.author ?? void 0, text: htmlToText(n.text), createdAt: n.created_at });
      if (depth < 3) walk(n.children, depth + 1);
    }
  };
  walk(item.children, 0);
  return {
    id: `hn:${id}`,
    source: "hn",
    url: `https://news.ycombinator.com/item?id=${id}`,
    title,
    text,
    replies
  };
}

// packages/core/src/sources/reddit.ts
function redditSearchQueries(query, opts) {
  const subs = opts.subreddits?.length ? opts.subreddits : [];
  const base = subs.length ? subs.map((s) => `site:reddit.com/r/${s.replace(/^r\//, "")} ${query}`) : [`site:reddit.com ${query}`];
  return base;
}
async function searchReddit(query, opts) {
  const queries = redditSearchQueries(query, opts);
  if (!hasDataForSEO()) {
    return {
      source: "reddit",
      query,
      items: [],
      hostSearchQueries: queries,
      notes: [
        "Reddit skipped: no DataForSEO credentials. gapscout never uses the Reddit API. Claude's web tools cannot access reddit.com; if your host's web search can, you may run hostSearchQueries yourself. Otherwise rely on forums.",
        "Set DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD to include Reddit (via Google results, from $0.0006 per query)."
      ]
    };
  }
  const country = opts.country ?? LANG_PACKS[opts.lang].country;
  const items = [];
  const notes = [];
  for (const q of queries) {
    try {
      const results = await serpTop(q, opts.lang, country, 20);
      for (const r of results) {
        if (!/reddit\.com\/r\/[^/]+\/comments\//.test(r.url)) continue;
        const sub = /reddit\.com\/r\/([^/]+)/.exec(r.url)?.[1];
        items.push({
          id: `rd:${r.url.replace(/^https?:\/\/(www\.|old\.)?reddit\.com/, "").split("?")[0]}`,
          source: "reddit",
          url: r.url,
          title: sub ? `[r/${sub}] ${r.title}` : r.title,
          text: r.snippet ?? ""
        });
      }
    } catch (e) {
      notes.push(`${q}: ${e.message}`);
    }
  }
  notes.push("Reddit items come from Google results (title + snippet). Claude cannot open reddit.com: quote only the snippet and mark it snippet_only.");
  return { source: "reddit", query, items: items.slice(0, opts.limit ?? 30), notes };
}

// packages/core/src/sources/stackexchange.ts
var BASE5 = "https://api.stackexchange.com/2.3";
var DEFAULT_SE_SITES = {
  en: ["stackoverflow", "superuser", "webapps", "softwarerecs"],
  fr: ["stackoverflow", "superuser", "softwarerecs", "french"],
  de: ["stackoverflow", "superuser", "softwarerecs", "german"],
  es: ["es.stackoverflow", "superuser", "softwarerecs"]
};
var backoffUntil = 0;
function keyParam() {
  return process.env.STACKEXCHANGE_KEY ? { key: process.env.STACKEXCHANGE_KEY } : {};
}
async function seFetch(path, params) {
  const wait = backoffUntil - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const qs = new URLSearchParams({ ...params, ...keyParam() });
  const data = await fetchJson(`${BASE5}${path}?${qs}`);
  if (data.backoff) backoffUntil = Date.now() + data.backoff * 1e3;
  return data;
}
async function searchStackExchange(query, opts) {
  const sites = opts.sites?.length ? opts.sites : DEFAULT_SE_SITES[opts.lang];
  const perSite = Math.max(5, Math.ceil((opts.limit ?? 30) / sites.length));
  const items = [];
  const notes = [];
  let quota;
  for (const site of sites) {
    try {
      const params = {
        order: "desc",
        sort: "relevance",
        q: query,
        site,
        filter: "withbody",
        pagesize: String(Math.min(perSite, 50))
      };
      if (opts.sinceDays) params.fromdate = String(daysAgoUnix(opts.sinceDays));
      const data = await seFetch("/search/advanced", params);
      quota = data.quota_remaining ?? quota;
      for (const q of data.items) {
        items.push({
          id: `se:${site}:${q.question_id}`,
          source: "stackexchange",
          url: q.link,
          title: htmlToText(q.title),
          text: htmlToText(q.body ?? ""),
          author: q.owner?.display_name,
          createdAt: new Date(q.creation_date * 1e3).toISOString(),
          engagement: q.score,
          comments: q.answer_count
        });
      }
    } catch (e) {
      notes.push(`${site}: ${e.message}`);
    }
  }
  if (quota !== void 0) notes.push(`Stack Exchange quota remaining today: ${quota}`);
  if (!process.env.STACKEXCHANGE_KEY) notes.push("Tip: set STACKEXCHANGE_KEY (free) for 10k requests/day instead of 300.");
  return { source: "stackexchange", query, items, notes };
}
async function getStackExchangeThread(id) {
  const [site, qid] = id.split(":");
  if (!site || !qid) throw new Error(`Stack Exchange id must look like "site:question_id", got "${id}"`);
  const q = await seFetch(`/questions/${qid}`, { site, filter: "withbody" });
  const a = await seFetch(`/questions/${qid}/answers`, {
    site,
    filter: "withbody",
    sort: "votes",
    order: "desc",
    pagesize: "30"
  });
  const question = q.items[0];
  return {
    id: `se:${id}`,
    source: "stackexchange",
    url: question?.link ?? `https://${site}.com/q/${qid}`,
    title: question ? htmlToText(question.title) : void 0,
    text: htmlToText(question?.body ?? ""),
    replies: a.items.map((x) => ({
      author: x.owner?.display_name,
      text: htmlToText(x.body ?? ""),
      engagement: x.score,
      createdAt: new Date(x.creation_date * 1e3).toISOString()
    }))
  };
}

// packages/core/src/scan.ts
async function searchComplaints(input) {
  const defaults = ["hn", "stackexchange", "github", "appstore", "bluesky", "reddit"];
  if (input.discourseDomains?.length) defaults.push("discourse");
  const sources = input.sources?.length ? input.sources : defaults;
  const opts = { lang: input.lang, sinceDays: input.sinceDays, limit: input.limit ?? 25 };
  const runners = {
    hn: () => searchHN(input.query, opts),
    stackexchange: () => searchStackExchange(input.query, { ...opts, sites: input.seSites }),
    github: () => searchGitHub(input.query, opts),
    appstore: () => searchAppStore(input.query, { ...opts, country: input.country }),
    bluesky: () => searchBluesky(input.query, opts),
    discourse: () => searchDiscourse(input.query, { ...opts, domains: input.discourseDomains ?? [] }),
    reddit: () => searchReddit(input.query, { ...opts, subreddits: input.subreddits, country: input.country })
  };
  const settled = await Promise.allSettled(sources.map((s) => runners[s]()));
  const results = settled.map((r, i) => {
    const source = sources[i];
    if (r.status === "rejected")
      return { source, query: input.query, items: [], notes: [`error: ${r.reason?.message ?? r.reason}`] };
    const res = r.value;
    for (const item of res.items) {
      const ph = painHint(`${item.title ?? ""}
${item.text}`, input.lang);
      item.painHint = ph.score;
      item.painTerms = ph.terms;
    }
    let items = res.items;
    if (input.painOnly) items = items.filter((x) => (x.painHint ?? 0) > 0 || (x.rating ?? 5) <= 2);
    items.sort((a, b) => rank(b) - rank(a));
    return { ...res, items };
  });
  return { query: input.query, lang: input.lang, results };
}
function rank(c) {
  const eng = Math.log10(1 + Math.max(0, c.engagement ?? 0) + (c.comments ?? 0));
  const ratingPain = c.rating ? (4 - c.rating) / 3 : 0;
  return (c.painHint ?? 0) * 2 + ratingPain + eng * 0.5;
}
async function getThread(id) {
  const [prefix, ...rest2] = id.split(":");
  const tail = rest2.join(":");
  switch (prefix) {
    case "hn":
      return getHNThread(tail);
    case "se":
      return getStackExchangeThread(tail);
    case "gh":
      return getGitHubThread(tail);
    case "bs":
      return getBlueskyThread(tail);
    case "dc":
      return getDiscourseThread(tail);
    case "rd":
      throw new Error("Reddit threads are read with your web fetch tool (open the thread URL), not through gapscout.");
    case "as":
      throw new Error("App Store reviews are standalone; there is no thread to fetch.");
    default:
      throw new Error(`Unknown id prefix "${prefix}". Expected hn:, se:, gh:, bs:, dc:.`);
  }
}
var JOB_NOISE = /\b(offres?|emplois?|jobs?|salaires?|recrutement|recrute|stage|alternance|cdi|télétravail|teletravail|hiring|salary|salaries|careers?|vacanc(y|ies)|remote jobs?|stellen\w*|gehalt|jobbörse|empleos?|sueldos?|trabajo|vacantes?)\b/i;
async function keywordDemand(input) {
  const country = (input.country ?? LANG_PACKS[input.lang].country).toLowerCase();
  const notes = [];
  let suggestions = await expandSeed(input.seed, input.lang, country, input.depth ?? "normal");
  const before = suggestions.length;
  suggestions = suggestions.filter((s) => !JOB_NOISE.test(s.keyword));
  if (suggestions.length < before) notes.push(`${before - suggestions.length} job-search suggestion(s) ignored (offre, emploi, salaire, hiring\u2026)`);
  if (input.mustInclude?.length) {
    const needles = input.mustInclude.map((w) => w.toLowerCase());
    suggestions = suggestions.filter((s) => needles.some((n) => s.keyword.includes(n)));
  }
  let volumes;
  if ((input.withVolumes ?? true) && hasDataForSEO() && suggestions.length) {
    try {
      volumes = await searchVolumes(suggestions.map((s) => s.keyword), input.lang, country);
    } catch (e) {
      notes.push(`volumes unavailable: ${e.message}`);
    }
  } else if (!hasDataForSEO()) {
    notes.push("Free mode: Google Autocomplete only (no volumes). Set DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD for monthly volumes.");
  }
  if (volumes) suggestions.sort((a, b) => (volumes[b.keyword] ?? -1) - (volumes[a.keyword] ?? -1));
  return {
    seed: input.seed,
    lang: input.lang,
    country,
    suggestions,
    volumes,
    demandScore: demandScore(suggestions, volumes),
    notes
  };
}
async function serpSnapshot(input) {
  const country = (input.country ?? LANG_PACKS[input.lang].country).toLowerCase();
  const notes = [];
  let results = input.results ?? [];
  if (!results.length && hasDataForSEO()) {
    results = await serpTop(input.query, input.lang, country, 10);
    notes.push("SERP from DataForSEO (Google organic, top 10).");
  } else if (!results.length) {
    notes.push(
      "No SERP data. Run this query with your web search tool, then call serp_snapshot again with `results` = [{position, url, title}] for the top 10."
    );
  } else {
    notes.push("SERP supplied by the host agent's web search (may differ slightly from Google).");
  }
  const { score, signals } = serpWeakness(input.query, results);
  return { query: input.query, results, weakness: score, signals, notes };
}

// packages/core/src/report.ts
var L = {
  en: {
    title: "Opportunities",
    generated: "Generated",
    sources: "Sources",
    score: "score",
    frequency: "Frequency",
    intensity: "Intensity",
    demand: "Google demand",
    serp: "SERP weakness",
    evidence: "Evidence",
    keywords: "Google keywords",
    idea: "Product idea",
    risks: "Skeptic's notes",
    audience: "Who",
    discarded: "Discarded by the skeptic",
    method: "Score = frequency \xD7 intensity \xD7 demand \xD7 SERP weakness (each 1\u20135), as 0\u2013100 (50 = all factors at 3/5). \u2713 = quote copied from the source's API or checked on the page.",
    snippet: "search snippet",
    gap: "Gap",
    competitors: "Existing solutions",
    notes: "Coverage notes",
    weak: "No strong opportunity in this scan (best score below 50/100, i.e. factors average under 3/5). Treat these as leads to dig into, not as validated bets."
  },
  fr: {
    title: "Opportunit\xE9s",
    generated: "G\xE9n\xE9r\xE9 le",
    sources: "Sources",
    score: "score",
    frequency: "Fr\xE9quence",
    intensity: "Intensit\xE9",
    demand: "Demande Google",
    serp: "Faiblesse SERP",
    evidence: "Preuves",
    keywords: "Mots-cl\xE9s Google",
    idea: "Id\xE9e de produit",
    risks: "Notes du sceptique",
    audience: "Qui",
    discarded: "\xC9cart\xE9es par le sceptique",
    method: "Score = fr\xE9quence \xD7 intensit\xE9 \xD7 demande \xD7 faiblesse SERP (chacun de 1 \xE0 5), sur 0\u2013100 (50 = tous les facteurs \xE0 3/5). \u2713 = citation copi\xE9e de l'API de la source ou v\xE9rifi\xE9e sur la page.",
    snippet: "extrait de recherche",
    gap: "Angle",
    competitors: "Solutions existantes",
    notes: "Limites de ce scan",
    weak: "Aucune opportunit\xE9 forte dans ce scan (meilleur score sous 50/100, facteurs en moyenne sous 3/5) : ce sont des pistes \xE0 creuser, pas des paris valid\xE9s."
  },
  de: {
    title: "Chancen",
    generated: "Erstellt am",
    sources: "Quellen",
    score: "Score",
    frequency: "H\xE4ufigkeit",
    intensity: "Intensit\xE4t",
    demand: "Google-Nachfrage",
    serp: "SERP-Schw\xE4che",
    evidence: "Belege",
    keywords: "Google-Keywords",
    idea: "Produktidee",
    risks: "Anmerkungen des Skeptikers",
    audience: "Wer",
    discarded: "Vom Skeptiker verworfen",
    method: "Score = H\xE4ufigkeit \xD7 Intensit\xE4t \xD7 Nachfrage \xD7 SERP-Schw\xE4che (je 1\u20135), auf 0\u2013100 (50 = alle Faktoren bei 3/5). \u2713 = Zitat aus der API der Quelle \xFCbernommen oder auf der Seite gepr\xFCft.",
    snippet: "Suchausschnitt",
    gap: "L\xFCcke",
    competitors: "Bestehende L\xF6sungen",
    notes: "Grenzen dieses Scans",
    weak: "Keine starke Chance in diesem Scan (bester Score unter 50/100, Faktoren im Schnitt unter 3/5): Spuren zum Vertiefen, keine validierten Wetten."
  },
  es: {
    title: "Oportunidades",
    generated: "Generado el",
    sources: "Fuentes",
    score: "puntuaci\xF3n",
    frequency: "Frecuencia",
    intensity: "Intensidad",
    demand: "Demanda en Google",
    serp: "Debilidad SERP",
    evidence: "Pruebas",
    keywords: "Palabras clave",
    idea: "Idea de producto",
    risks: "Notas del esc\xE9ptico",
    audience: "Qui\xE9n",
    discarded: "Descartadas por el esc\xE9ptico",
    method: "Puntuaci\xF3n = frecuencia \xD7 intensidad \xD7 demanda \xD7 debilidad SERP (cada una 1\u20135), en 0\u2013100 (50 = todos los factores en 3/5). \u2713 = cita copiada de la API de la fuente o verificada en la p\xE1gina.",
    snippet: "fragmento de b\xFAsqueda",
    gap: "Hueco",
    competitors: "Soluciones existentes",
    notes: "L\xEDmites de este an\xE1lisis",
    weak: "Ninguna oportunidad fuerte en este an\xE1lisis (mejor puntuaci\xF3n bajo 50/100, factores de media bajo 3/5): pistas para investigar, no apuestas validadas."
  }
};
function withScores(r) {
  const opportunities = r.opportunities.map((o) => ({ ...o, score: opportunityScore(o.frequency, o.intensity, o.demand, o.serpWeakness).outOf100 })).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return { ...r, opportunities };
}
function esc(s) {
  return s.replace(/\|/g, "\\|").replace(/\n+/g, " ");
}
function renderOpportunity(o, i, t) {
  const lines = [];
  lines.push(`## ${i + 1}. ${o.title} \u2014 ${t.score} ${o.score ?? "?"}/100`, "");
  lines.push(`> ${o.problem.replace(/\n+/g, " ")}`, "");
  if (o.audience) lines.push(`**${t.audience}:** ${o.audience}`, "");
  if (o.gap) lines.push(`**${t.gap}:** ${o.gap}`, "");
  lines.push(`| ${t.frequency} | ${t.intensity} | ${t.demand} | ${t.serp} |`, "|---|---|---|---|");
  lines.push(
    `| **${o.frequency.value}/5** ${esc(o.frequency.why)} | **${o.intensity.value}/5** ${esc(o.intensity.why)} | **${o.demand.value}/5** ${esc(o.demand.why)} | **${o.serpWeakness.value}/5** ${esc(o.serpWeakness.why)} |`,
    ""
  );
  lines.push(`**${t.evidence}**`, "");
  for (const e of o.evidence) {
    const mark = e.verified === "api" || e.verified === "exact" || e.verified === "close" || e.verified === "manual" ? " \u2713" : e.verified === "snippet" ? ` (${t.snippet})` : "";
    lines.push(`- \u201C${e.quote.replace(/\n+/g, " ")}\u201D \u2014 [${e.source}](${e.url})${mark}`);
  }
  lines.push("");
  if (o.keywords.length) {
    const kws = o.keywords.map((k) => k.volume != null ? `\`${k.keyword}\` (${k.volume.toLocaleString("en-US")}/mo)` : `\`${k.keyword}\``);
    lines.push(`**${t.keywords}:** ${kws.join(", ")}`, "");
  }
  if (o.competitors?.length) lines.push(`**${t.competitors}:** ${o.competitors.join(", ")}`, "");
  lines.push(`**${t.idea}:** ${o.productIdea}`, "");
  if (o.risks?.length) {
    lines.push(`**${t.risks}**`, "");
    for (const r of o.risks) lines.push(`- ${r}`);
    lines.push("");
  }
  return lines.join("\n");
}
function renderReport(report) {
  const r = withScores(report);
  const t = L[r.lang] ?? L.en;
  const out = [];
  out.push(`# gapscout \xB7 ${r.niche}`, "");
  out.push(`_${t.generated} ${r.generatedAt.slice(0, 10)} \xB7 ${t.sources}: ${r.sourcesUsed.join(", ")} \xB7 ${t.method}_`, "");
  out.push(`| # | ${t.title} | ${t.score} | F | I | D | S |`, "|---|---|---|---|---|---|---|");
  r.opportunities.forEach(
    (o, i) => out.push(`| ${i + 1} | ${esc(o.title)} | **${o.score}** | ${o.frequency.value} | ${o.intensity.value} | ${o.demand.value} | ${o.serpWeakness.value} |`)
  );
  out.push("");
  if ((r.opportunities[0]?.score ?? 0) < 50) out.push(`> \u26A0\uFE0F ${t.weak}`, "");
  if (r.notes?.length) {
    out.push(`**${t.notes}**`, "");
    for (const n of r.notes) out.push(`- ${n}`);
    out.push("");
  }
  r.opportunities.forEach((o, i) => out.push(renderOpportunity(o, i, t)));
  if (r.discarded?.length) {
    out.push(`## ${t.discarded}`, "");
    for (const d of r.discarded) out.push(`- **${d.title}** \u2014 ${d.reason}`);
    out.push("");
  }
  out.push("---", "_Made with [gapscout](https://github.com/joaquimmj/gapscout) \u2014 find problems worth building._", "");
  return out.join("\n");
}

// packages/core/src/cluster.ts
var EXTRA_STOP = "weil etwas dadurch dass allem dann gibt ohne gro\xDFe gro\xDFen mehrheit immer wieder schon einfach leider bitte danke habe hatte hat wurde werden wird kann k\xF6nnen muss m\xFCssen soll sollte geht alle alles dieses jeder jede nichts viel viele wirklich eigentlich also doch mal hier dort gerade selbst depuis avant apr\xE8s encore toujours vraiment faut peut veut rien chaque trop moins quand alors donc parce puis cela celui celle leurs avoir sont \xE9tait fois avez sais suis desde antes despu\xE9s todav\xEDa siempre realmente hay puede quiere nada cada demasiado menos cuando entonces porque luego tiene tengo sido yes love feedback high quality real thanks please would could should really just also still even want need make made using used thing things lot lots way ways able".split(" ");
function relevantToNiche(c, niche) {
  if (c.source === "appstore") return true;
  const stems = niche.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).filter((w) => w.length >= 4).map((w) => w.slice(0, 5));
  if (!stems.length) return true;
  const text = `${c.title ?? ""} ${c.text}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return stems.some((s) => text.includes(s));
}
function tokens(text, stop) {
  return text.toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/\S+@\S+/g, " ").replace(/[`*_>#\[\](){}"“”«».,;:!?/\\|=+<~^%$@&0-9-]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !stop.has(w) && !/^'/.test(w));
}
function container(c) {
  if (c.source === "appstore") return c.id.split(":").slice(0, 3).join(":");
  if (c.source === "github") return c.id.split("#")[0];
  if (c.source === "stackexchange") return c.id;
  return c.title ? `${c.source}:${c.title}` : c.id;
}
function cleanTitle(t) {
  return (t ?? "").replace(/^\[[^\]]*\]\s*/, "");
}
function extractThemes(items, lang, nicheTerms, max = 12) {
  const stop = /* @__PURE__ */ new Set([
    ...LANG_PACKS[lang].stopwords,
    ...LANG_PACKS.en.stopwords,
    ...EXTRA_STOP,
    ...nicheTerms.map((t) => t.toLowerCase())
  ]);
  const byGram = /* @__PURE__ */ new Map();
  items.forEach((c, idx) => {
    const toks = tokens(`${cleanTitle(c.title)} ${c.text}`, stop);
    const grams = /* @__PURE__ */ new Set();
    for (let n = 2; n <= 3; n++)
      for (let i = 0; i + n <= toks.length; i++) {
        const gram = toks.slice(i, i + n);
        if (gram.some((w) => w.length >= 5)) grams.add(gram.join(" "));
      }
    for (const g of grams) {
      if (!byGram.has(g)) byGram.set(g, /* @__PURE__ */ new Set());
      byGram.get(g).add(idx);
    }
  });
  const ranked = [...byGram.entries()].filter(([, s]) => s.size >= 2).map(([g, s]) => ({ g, its: [...s].map((i) => items[i]) })).filter(({ its }) => new Set(its.map(container)).size >= 2).map(({ g, its }) => {
    const avgPain = its.reduce((a, c) => a + (c.painHint ?? 0), 0) / its.length;
    const sources = [...new Set(its.map((c) => c.source))];
    return { phrase: g, items: its, sources, avgPain, weight: its.length * (1 + avgPain) * (1 + 0.3 * (sources.length - 1)) };
  }).sort((a, b) => b.weight - a.weight);
  const kept = [];
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

// packages/cli/src/index.ts
var HELP = `gapscout \u2014 find problems worth building, proven by real complaints and real Google demand.

Usage
  gapscout scan "<niche>" [--lang en|fr|de|es] [--sources hn,stackexchange,github,appstore]
                          [--since <days>] [--limit <n>] [--themes <n>] [--no-demand] [--out <dir>] [--json]
  gapscout search "<query>" [--lang fr] [--sources hn,reddit,\u2026] [--since <days>] [--limit <n>]
                            [--se-sites money,freelancing] [--discourse-domains forum.x.com] [--country fr]   (JSON)
  gapscout demand "<keyword>" [--lang fr] [--country fr] [--depth quick|normal|deep]
  gapscout serp "<query>" [--lang fr] [--results top10.json]
                               (scores results you pass; fetches them itself with DATAFORSEO_*)
  gapscout thread <id>                         (hn:123 \xB7 se:superuser:456 \xB7 gh:owner/repo#7)
  gapscout fetch <url>                         (raw page text, robots.txt respected)
  gapscout verify <url> "<quote>"              (is the quote really on the page?)
  gapscout render <report.json> [--json]       (JSON report \u2192 Markdown, or scored JSON)

search / demand --json / serp / thread print the same JSON as the MCP tools of the same name.

The CLI does a raw, LLM-free scan (n-gram themes). For clustered, skeptic-checked reports
with product ideas, use the Claude Code plugin: /gapscout "<niche>" --lang fr

Env (all optional): GITHUB_TOKEN, STACKEXCHANGE_KEY, DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD,
GAPSCOUT_CACHE_DIR, GAPSCOUT_NO_CACHE=1`;
var { values, positionals } = parseArgs({
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
    help: { type: "boolean", short: "h", default: false }
  }
});
var [cmd, ...rest] = positionals;
var arg = rest.join(" ").trim();
function die(msg) {
  process.stderr.write(`${msg}
`);
  process.exit(1);
}
function langOpt() {
  const l = values.lang.toLowerCase();
  if (!isLang(l)) die(`--lang must be one of en, fr, de, es (got "${l}")`);
  return l;
}
var log = (s) => process.stderr.write(`${s}
`);
async function scan() {
  if (!arg) die('Usage: gapscout scan "<niche>"');
  const lang = langOpt();
  const defaults = lang === "en" ? ["hn", "stackexchange", "github", "appstore"] : ["stackexchange", "appstore"];
  const sources = values.sources?.split(",").map((s) => s.trim()) ?? defaults;
  for (const s of sources) if (!SOURCE_IDS.includes(s)) die(`Unknown source "${s}". Known: ${SOURCE_IDS.join(", ")}`);
  const sinceDays = values.since ? Number(values.since) : void 0;
  const limit = values.limit ? Number(values.limit) : 25;
  const queries = complaintQueries(arg, lang).slice(0, 3);
  const all = /* @__PURE__ */ new Map();
  const notes = /* @__PURE__ */ new Set();
  for (const q of queries) {
    log(`\u2192 searching "${q}" on ${sources.join(", ")}`);
    const res = await searchComplaints({ query: q, lang, sources, sinceDays, limit, country: values.country });
    for (const r of res.results) {
      for (const i of r.items) all.set(i.id, i);
      for (const n of r.notes) if (!/total hits|matching issues|quota remaining/.test(n)) notes.add(`${r.source}: ${n}`);
    }
  }
  const fetched = all.size;
  const items = [...all.values()].filter((c) => relevantToNiche(c, arg));
  log(`\u2192 ${fetched} items fetched, ${items.length} mention the niche; extracting themes`);
  const themes = extractThemes(items, lang, arg.split(/\s+/), Number(values.themes));
  const demand = {};
  if (!values["no-demand"]) {
    for (const t of themes) {
      log(`\u2192 Google demand for "${t.phrase}"`);
      demand[t.phrase] = await keywordDemand({ seed: t.phrase, lang, country: values.country, depth: values.depth });
    }
  }
  const result = {
    niche: arg,
    lang,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    sources,
    itemCount: items.length,
    themes: themes.map((t) => ({
      phrase: t.phrase,
      mentions: t.items.length,
      sources: t.sources,
      avgPain: Math.round(t.avgPain * 100) / 100,
      demand: demand[t.phrase] && {
        score: demand[t.phrase].demandScore,
        suggestions: demand[t.phrase].suggestions.slice(0, 8).map((s) => s.keyword),
        volumes: demand[t.phrase].volumes
      },
      evidence: t.items.sort((a, b) => (b.painHint ?? 0) - (a.painHint ?? 0)).slice(0, 4).map((i) => ({ id: i.id, url: i.url, title: i.title, quote: truncate(i.text.replace(/\s+/g, " "), 220), pain: i.painHint }))
    })),
    topPainItems: items.sort((a, b) => (b.painHint ?? 0) - (a.painHint ?? 0)).slice(0, 10).map((i) => ({ id: i.id, url: i.url, title: i.title, quote: truncate(i.text.replace(/\s+/g, " "), 220), pain: i.painHint, terms: i.painTerms })),
    notes: [...notes]
  };
  const md = renderRaw(result);
  if (values.out) {
    mkdirSync2(values.out, { recursive: true });
    const slug = arg.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const base = join2(values.out, `${slug}-${lang}-raw`);
    writeFileSync(`${base}.md`, md);
    writeFileSync(`${base}.json`, JSON.stringify(result, null, 2));
    log(`\u2713 wrote ${base}.md and ${base}.json`);
  }
  process.stdout.write(values.json ? JSON.stringify(result, null, 2) + "\n" : md);
}
function renderRaw(r) {
  const o = [];
  o.push(`# gapscout raw scan \xB7 ${r.niche} (${r.lang})`, "");
  o.push(`_${r.generatedAt.slice(0, 10)} \xB7 ${r.itemCount} items from ${r.sources.join(", ")} \xB7 LLM-free n-gram themes. For clustered, scored opportunities run \`/gapscout\` in Claude Code._`, "");
  o.push("## Recurring themes", "");
  if (!r.themes.length)
    o.push(
      "_Not enough cross-source data to find themes without an LLM (a theme must appear in 2+ apps, repos or threads). Below are the strongest individual complaints. For this language, run `/gapscout` in Claude Code: it adds Reddit (via web search) and review sites._",
      ""
    );
  else o.push("| Theme | Mentions | Sources | Pain | Google demand |", "|---|---|---|---|---|");
  for (const t of r.themes)
    o.push(`| ${t.phrase} | ${t.mentions} | ${t.sources.join(", ")} | ${t.avgPain} | ${t.demand ? `${t.demand.score.value}/5` : "\u2013"} |`);
  o.push("");
  for (const t of r.themes) {
    o.push(`### ${t.phrase}`, "");
    if (t.demand) o.push(`Demand ${t.demand.score.value}/5 \u2014 ${t.demand.score.why}`, "", t.demand.suggestions.length ? `Autocomplete: ${t.demand.suggestions.map((s) => `\`${s}\``).join(", ")}` : "", "");
    for (const e of t.evidence) o.push(`- \u201C${e.quote}\u201D \u2014 [${e.title ? truncate(e.title, 70) : "source"}](${e.url})`);
    o.push("");
  }
  o.push("## Strongest pain signals", "");
  for (const e of r.topPainItems) o.push(`- (${e.pain}) \u201C${e.quote}\u201D \u2014 [${e.title ? truncate(e.title, 70) : "source"}](${e.url})`);
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
      const d = await keywordDemand({ seed: arg, lang: langOpt(), country: values.country, depth: values.depth });
      if (values.json) return void process.stdout.write(JSON.stringify(d, null, 2) + "\n");
      process.stdout.write(`Demand ${d.demandScore.value}/5 \u2014 ${d.demandScore.why}

`);
      for (const s of d.suggestions) process.stdout.write(`${s.keyword}${d.volumes ? `	${d.volumes[s.keyword] ?? "\u2013"}` : ""}
`);
      for (const n of d.notes) process.stderr.write(`note: ${n}
`);
      return;
    }
    case "search": {
      if (!arg) die('Usage: gapscout search "<query>"');
      const list = (s) => s?.split(",").map((x) => x.trim()).filter(Boolean);
      const sources = list(values.sources);
      for (const s of sources ?? []) if (!SOURCE_IDS.includes(s)) die(`Unknown source "${s}". Known: ${SOURCE_IDS.join(", ")}`);
      const out = await searchComplaints({
        query: arg,
        lang: langOpt(),
        sources,
        sinceDays: values.since ? Number(values.since) : void 0,
        limit: values.limit ? Number(values.limit) : void 0,
        country: values.country,
        seSites: list(values["se-sites"]),
        subreddits: list(values.subreddits),
        discourseDomains: list(values["discourse-domains"])
      });
      for (const r of out.results) r.items = r.items.map((i) => ({ ...i, text: truncate(i.text, 500) }));
      return void process.stdout.write(JSON.stringify(out, null, 1) + "\n");
    }
    case "serp": {
      if (!arg) die('Usage: gapscout serp "<query>" [--results top10.json]');
      const results = values.results ? JSON.parse(readFileSync(values.results, "utf8")) : void 0;
      if (!results && !hasDataForSEO())
        die("serp needs --results <file.json> ([{position,url,title}] from your web search) or DATAFORSEO_LOGIN/PASSWORD.");
      const s = await serpSnapshot({ query: arg, lang: langOpt(), country: values.country, results });
      return void process.stdout.write(JSON.stringify(s, null, 2) + "\n");
    }
    case "fetch": {
      if (!arg) die("Usage: gapscout fetch <url>");
      const p = await fetchPage(arg);
      return void process.stdout.write(JSON.stringify({ url: p.url, title: p.title, chars: p.text.length, text: truncate(p.text, 2e4) }, null, 2) + "\n");
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
    case "render": {
      if (!arg) die("Usage: gapscout render <report.json>");
      const report = JSON.parse(readFileSync(arg, "utf8"));
      if (values.json) return void process.stdout.write(JSON.stringify(withScores(report), null, 2) + "\n");
      return void process.stdout.write(renderReport(report));
    }
    default:
      die(`Unknown command "${cmd}".

${HELP}`);
  }
}
main().catch((e) => die(`gapscout: ${e.message}`));
