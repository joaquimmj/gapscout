// Stack Exchange API 2.3. 300 req/day without a key, 10k/day with a free key from stackapps.com
// (STACKEXCHANGE_KEY). We honour the `backoff` field as the terms require.
// Terms: https://api.stackexchange.com/docs/throttle
import { daysAgoUnix, fetchJson, htmlToText } from "../http.js";
import type { Complaint, Lang, SearchOptions, SourceResult, Thread } from "../types.js";

const BASE = "https://api.stackexchange.com/2.3";

/** Sites where non-developer pain shows up too. Callers can override per niche. */
export const DEFAULT_SE_SITES: Record<Lang, string[]> = {
  en: ["stackoverflow", "superuser", "webapps", "softwarerecs"],
  fr: ["stackoverflow", "superuser", "softwarerecs", "french"],
  de: ["stackoverflow", "superuser", "softwarerecs", "german"],
  es: ["es.stackoverflow", "superuser", "softwarerecs"],
};

let backoffUntil = 0;

interface Wrapper<T> {
  items: T[];
  quota_remaining?: number;
  backoff?: number;
  has_more?: boolean;
}
interface Question {
  question_id: number;
  title: string;
  body?: string;
  link: string;
  score: number;
  answer_count: number;
  view_count?: number;
  creation_date: number;
  owner?: { display_name?: string };
}

function keyParam(): Record<string, string> {
  return process.env.STACKEXCHANGE_KEY ? { key: process.env.STACKEXCHANGE_KEY } : {};
}

async function seFetch<T>(path: string, params: Record<string, string>): Promise<Wrapper<T>> {
  const wait = backoffUntil - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const qs = new URLSearchParams({ ...params, ...keyParam() });
  const data = await fetchJson<Wrapper<T>>(`${BASE}${path}?${qs}`);
  if (data.backoff) backoffUntil = Date.now() + data.backoff * 1000;
  return data;
}

export async function searchStackExchange(
  query: string,
  opts: SearchOptions & { sites?: string[] },
): Promise<SourceResult> {
  const sites = opts.sites?.length ? opts.sites : DEFAULT_SE_SITES[opts.lang];
  const perSite = Math.max(5, Math.ceil((opts.limit ?? 30) / sites.length));
  const items: Complaint[] = [];
  const notes: string[] = [];
  let quota: number | undefined;
  for (const site of sites) {
    try {
      const params: Record<string, string> = {
        order: "desc",
        sort: "relevance",
        q: query,
        site,
        filter: "withbody",
        pagesize: String(Math.min(perSite, 50)),
      };
      if (opts.sinceDays) params.fromdate = String(daysAgoUnix(opts.sinceDays));
      const data = await seFetch<Question>("/search/advanced", params);
      quota = data.quota_remaining ?? quota;
      for (const q of data.items) {
        items.push({
          id: `se:${site}:${q.question_id}`,
          source: "stackexchange",
          url: q.link,
          title: htmlToText(q.title),
          text: htmlToText(q.body ?? ""),
          author: q.owner?.display_name,
          createdAt: new Date(q.creation_date * 1000).toISOString(),
          engagement: q.score,
          comments: q.answer_count,
        });
      }
    } catch (e) {
      notes.push(`${site}: ${(e as Error).message}`);
    }
  }
  if (quota !== undefined) notes.push(`Stack Exchange quota remaining today: ${quota}`);
  if (!process.env.STACKEXCHANGE_KEY) notes.push("Tip: set STACKEXCHANGE_KEY (free) for 10k requests/day instead of 300.");
  return { source: "stackexchange", query, items, notes };
}

interface Answer {
  body?: string;
  score: number;
  creation_date: number;
  owner?: { display_name?: string };
}

/** id is "site:question_id", e.g. "superuser:123456". */
export async function getStackExchangeThread(id: string): Promise<Thread> {
  const [site, qid] = id.split(":");
  if (!site || !qid) throw new Error(`Stack Exchange id must look like "site:question_id", got "${id}"`);
  const q = await seFetch<Question>(`/questions/${qid}`, { site, filter: "withbody" });
  const a = await seFetch<Answer>(`/questions/${qid}/answers`, {
    site,
    filter: "withbody",
    sort: "votes",
    order: "desc",
    pagesize: "30",
  });
  const question = q.items[0];
  return {
    id: `se:${id}`,
    source: "stackexchange",
    url: question?.link ?? `https://${site}.com/q/${qid}`,
    title: question ? htmlToText(question.title) : undefined,
    text: htmlToText(question?.body ?? ""),
    replies: a.items.map((x) => ({
      author: x.owner?.display_name,
      text: htmlToText(x.body ?? ""),
      engagement: x.score,
      createdAt: new Date(x.creation_date * 1000).toISOString(),
    })),
  };
}
