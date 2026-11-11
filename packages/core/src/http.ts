import { getCache } from "./cache.js";

export const USER_AGENT = "gapscout/0.1 (+https://github.com/joaquimmj/gapscout)";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    readonly body: string,
  ) {
    super(`HTTP ${status} for ${redact(url)}: ${body.slice(0, 200)}`);
  }
}

function redact(url: string) {
  return url.replace(/([?&](key|access_token|token)=)[^&]+/gi, "$1***");
}

export interface FetchJsonOptions {
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  body?: unknown;
  /** Cache TTL in seconds; 0 disables. Default 6h. */
  ttl?: number;
  timeoutMs?: number;
  retries?: number;
  /** "error" for agent-supplied hosts, so a redirect can't lead to a private address. */
  redirect?: RequestRedirect;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET/POST JSON with a timeout, a polite retry on 429/5xx, and the local cache. */
export async function fetchJson<T>(url: string, opts: FetchJsonOptions = {}): Promise<T> {
  const ttl = opts.ttl ?? 6 * 3600;
  const cacheKey = `${opts.method ?? "GET"} ${url} ${opts.body ? JSON.stringify(opts.body) : ""}`;
  const cache = getCache();
  if (ttl > 0) {
    const hit = cache.get<T>(cacheKey);
    if (hit !== undefined) return hit;
  }
  const retries = opts.retries ?? 2;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
          ...(opts.body ? { "Content-Type": "application/json" } : {}),
          ...opts.headers,
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        redirect: opts.redirect,
        signal: AbortSignal.timeout(opts.timeoutMs ?? 20_000),
      });
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get("retry-after")) || 2 ** attempt;
        lastErr = new HttpError(res.status, url, await res.text());
        if (attempt < retries) {
          await sleep(Math.min(retryAfter, 10) * 1000);
          continue;
        }
        throw lastErr;
      }
      if (!res.ok) throw new HttpError(res.status, url, await res.text());
      const data = (await res.json()) as T;
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

export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

// Named entities seen on FR/DE/ES/EN forums. Accented letters are generated from the Latin-1 pattern.
const NAMED: Record<string, string> = {
  quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  laquo: "«", raquo: "»", hellip: "…", ndash: "–", mdash: "—", euro: "€", oelig: "œ", OElig: "Œ",
  szlig: "ß", deg: "°", copy: "©", reg: "®", middot: "·", bull: "•", iexcl: "¡", iquest: "¿", shy: "",
};
const ACCENTS: Record<string, string> = { acute: "́", grave: "̀", circ: "̂", uml: "̈", tilde: "̃", cedil: "̧", ring: "̊" };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    if (e in NAMED) return NAMED[e]!;
    const acc = /^([a-z])(acute|grave|circ|uml|tilde|cedil|ring)$/i.exec(e);
    if (acc) return (acc[1]! + ACCENTS[acc[2]!]).normalize("NFC");
    if (e === "amp") return "&";
    return m;
  });
}

/** Strip HTML tags and decode entities. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(br|p|\/p|li|\/li|div|\/div|h\d|\/h\d|tr|blockquote)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function daysAgoUnix(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 86400;
}
