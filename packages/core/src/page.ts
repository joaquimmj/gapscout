// Raw page text, so quotes are copied verbatim (an LLM fetch tool may summarise pages),
// and quote verification against the live page. Polite by design: honours robots.txt,
// identifies itself, caches for a day, and never touches Reddit.
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { getCache } from "./cache.js";
import { htmlToText, truncate, USER_AGENT } from "./http.js";

export interface Page {
  url: string;
  status: number;
  title?: string;
  text: string;
}

const NEVER = [/(^|\.)reddit\.com$/i, /(^|\.)redd\.it$/i];

/** Loopback, private, link-local (incl. cloud metadata), CGNAT, multicast and reserved addresses. */
export function isPrivateIp(ip: string): boolean {
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (isIP(v4) === 4) {
    const [a, b] = v4.split(".").map(Number) as [number, number];
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const x = ip.toLowerCase();
  return x === "::" || x === "::1" || /^f[cd]/.test(x) || /^fe[89ab]/.test(x) || x.startsWith("ff");
}

/**
 * URLs reach us from agents reading untrusted web pages: refuse anything but public http(s) hosts,
 * so a prompt injection can't make gapscout read localhost, the LAN or cloud metadata.
 * shortcut: DNS is resolved here and again by fetch (rebinding window), fine for a local CLI; pin the IP if hosted.
 */
export async function assertPublicUrl(url: string): Promise<URL> {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) URLs.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (/^localhost$|\.localhost$|\.local$|\.internal$/i.test(host)) throw new Error(`Refusing non-public host ${host}.`);
  const addrs = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
  if (!addrs.length || addrs.some(isPrivateIp)) throw new Error(`Refusing non-public address for ${host}.`);
  return u;
}

async function getText(url: string, timeoutMs = 15_000): Promise<{ status: number; body: string; type: string }> {
  // Follow redirects by hand so every hop is checked against private addresses.
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicUrl(url);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,text/plain;q=0.9,*/*;q=0.5" },
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const next = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!next) return { status: res.status, body: await readCapped(res), type: res.headers.get("content-type") ?? "" };
    url = new URL(next, url).toString();
  }
  throw new Error("Too many redirects.");
}

const MAX_BYTES = 5_000_000;

/** Agent-supplied URLs may point at huge or binary files: read text only, at most 5 MB. */
async function readCapped(res: Response): Promise<string> {
  const type = res.headers.get("content-type") ?? "";
  if (type && !/text|html|xml|json/i.test(type)) {
    await res.body?.cancel();
    throw new Error(`Not a text page (${type}).`);
  }
  if (Number(res.headers.get("content-length")) > MAX_BYTES) {
    await res.body?.cancel();
    throw new Error("Page larger than 5 MB.");
  }
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw new Error("Page larger than 5 MB.");
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

/** Minimal robots.txt check for our user agent (groups for "gapscout" or "*", Allow/Disallow prefixes). */
export async function robotsAllows(url: string): Promise<boolean> {
  const u = new URL(url);
  const cache = getCache();
  const key = `robots ${u.origin}`;
  let rules = cache.get<{ allow: string[]; disallow: string[] }>(key);
  if (!rules) {
    rules = { allow: [], disallow: [] };
    try {
      const { status, body } = await getText(`${u.origin}/robots.txt`, 8_000);
      if (status === 200) {
        let applies = false;
        let sawAgentInGroup = false;
        for (const raw of body.split(/\r?\n/)) {
          const line = raw.replace(/#.*/, "").trim();
          const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
          if (!m) continue;
          const field = m[1]!.toLowerCase();
          const value = m[2]!.trim();
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
      // No reachable robots.txt: allowed.
    }
    cache.set(key, rules, 86400);
  }
  const path = u.pathname + u.search;
  const longest = (list: string[]) => Math.max(-1, ...list.filter((p) => robotsMatch(p, path)).map((p) => p.length));
  return longest(rules.allow) >= longest(rules.disallow);
}

/** robots.txt path pattern: prefix match, `*` = any sequence, trailing `$` = end of URL (RFC 9309). */
export function robotsMatch(pattern: string, path: string): boolean {
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const re = new RegExp("^" + body.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + (anchored ? "$" : ""));
  return re.test(path);
}

export async function fetchPage(url: string): Promise<Page> {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) URLs.");
  if (NEVER.some((re) => re.test(u.hostname)))
    throw new Error("gapscout never fetches reddit.com. Use Reddit search snippets (DataForSEO) instead.");
  if (!(await robotsAllows(url))) throw new Error(`robots.txt of ${u.hostname} disallows this page for crawlers; not fetched.`);
  const cache = getCache();
  const hit = cache.get<Page>(`page ${url}`);
  if (hit) return hit;
  const { status, body, type } = await getText(url);
  if (status >= 400) throw new Error(`HTTP ${status} for ${url}`);
  const isHtml = /html|xml/.test(type) || /^\s*</.test(body);
  const title = isHtml ? /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1]?.trim() : undefined;
  const text = isHtml
    ? htmlToText(
        body
          .replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
          .replace(/<!--[\s\S]*?-->/g, " "),
      )
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n+/g, "\n\n")
    : body;
  const page: Page = { url, status, title: title ? htmlToText(title) : undefined, text };
  cache.set(`page ${url}`, page, 86400);
  return page;
}

export function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”«»„]/g, '"')
    .replace(/[…]/g, "...")
    .replace(/[^\p{L}\p{N}'"]+/gu, " ")
    .trim();
}

export type QuoteCheck = {
  url: string;
  status: "exact" | "close" | "not_found" | "unreachable";
  /** Share of the quote's 4-word sequences found on the page (0–1). */
  overlap?: number;
  /** The page passage that best matches, to copy instead of the paraphrase. */
  excerpt?: string;
  error?: string;
  /** Plain-language reason when the status is not exact, to show to the reader. */
  reason?: string;
};

/** Is this quote really on that page? "close" = same words with small edits (ellipsis, trimming). */
export async function verifyQuote(url: string, quote: string): Promise<QuoteCheck> {
  let page: Page;
  try {
    page = await fetchPage(url);
  } catch (e) {
    return { url, status: "unreachable", error: (e as Error).message, reason: `The page could not be read (${(e as Error).message}), so the quote is unchecked.` };
  }
  const hay = normalizeForMatch(page.text);
  // A quote may elide parts with "..." / "…": check each fragment.
  let fragments = quote
    .split(/\.\.\.|…|\[\.\.\.\]/)
    .map(normalizeForMatch)
    .filter((f) => f.split(" ").length >= 3);
  // Short quotes ("Abo Falle!") have no 3-word fragment: match the whole quote instead.
  if (!fragments.length) fragments = [normalizeForMatch(quote)].filter(Boolean);
  if (fragments.length && fragments.every((f) => hay.includes(f))) {
    return { url, status: "exact", overlap: 1, excerpt: excerptAround(page.text, quote) };
  }
  const words = normalizeForMatch(quote).split(" ");
  const grams: string[] = [];
  for (let i = 0; i + 4 <= words.length; i++) grams.push(words.slice(i, i + 4).join(" "));
  const overlap = grams.length ? grams.filter((g) => hay.includes(g)).length / grams.length : 0;
  return {
    url,
    status: overlap >= 0.6 ? "close" : "not_found",
    overlap: Math.round(overlap * 100) / 100,
    excerpt: overlap >= 0.3 ? excerptAround(page.text, quote) : undefined,
    reason:
      overlap >= 0.6
        ? "Most of the wording is on the page; the quote was trimmed or lightly edited. Use the excerpt."
        : overlap >= 0.3
          ? "Part of the wording is on the page: the quote was reworded. Check the excerpt by hand."
          : "The page was read, and this text is not on it.",
  };
}

/** Return ~300 chars of the original page text around the best-matching 4-gram. */
function excerptAround(text: string, quote: string): string | undefined {
  const words = quote.split(/\s+/).filter((w) => w.length > 3);
  for (let i = 0; i + 3 <= words.length; i++) {
    const probe = words.slice(i, i + 3).join(" ");
    const idx = text.toLowerCase().indexOf(probe.toLowerCase());
    if (idx >= 0) return truncate(text.slice(Math.max(0, idx - 40), idx + 300).replace(/\s+/g, " ").trim(), 340);
  }
  return undefined;
}
