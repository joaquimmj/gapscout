// Hacker News via the public Algolia API. No key. Terms: https://hn.algolia.com/api
import { daysAgoUnix, fetchJson, htmlToText } from "../http.js";
import type { Complaint, SearchOptions, SourceResult, Thread } from "../types.js";

const BASE = "https://hn.algolia.com/api/v1";

interface Hit {
  objectID: string;
  title?: string | null;
  story_title?: string | null;
  story_text?: string | null;
  comment_text?: string | null;
  url?: string | null;
  author?: string;
  points?: number | null;
  num_comments?: number | null;
  created_at?: string;
  _tags?: string[];
}

export async function searchHN(query: string, opts: SearchOptions): Promise<SourceResult> {
  const limit = Math.min(opts.limit ?? 30, 100);
  const params = new URLSearchParams({
    query,
    tags: "(story,comment,ask_hn)",
    hitsPerPage: String(limit),
  });
  if (opts.sinceDays) params.set("numericFilters", `created_at_i>${daysAgoUnix(opts.sinceDays)}`);
  const data = await fetchJson<{ hits: Hit[]; nbHits: number }>(`${BASE}/search?${params}`);
  // Monthly hiring threads match every job keyword and contain no complaints.
  const HIRING = /who is hiring|who wants to be hired|seeking freelancer|freelancer\? seeking/i;
  const hits = data.hits.filter((h) => !HIRING.test(h.story_title ?? h.title ?? ""));
  const items: Complaint[] = hits.map((h) => {
    const isComment = h._tags?.includes("comment");
    const text = htmlToText(h.comment_text ?? h.story_text ?? "");
    return {
      id: `hn:${h.objectID}`,
      source: "hn",
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
      title: (isComment ? h.story_title : h.title) ?? undefined,
      text: text || (h.title ?? ""),
      author: h.author,
      createdAt: h.created_at,
      engagement: h.points ?? undefined,
      comments: h.num_comments ?? undefined,
    };
  });
  return { source: "hn", query, items, notes: [`${data.nbHits} total hits on HN`] };
}

interface Item {
  id: number;
  title?: string | null;
  text?: string | null;
  author?: string | null;
  points?: number | null;
  created_at?: string;
  children?: Item[];
  type?: string;
  story_id?: number | null;
}

export async function getHNThread(id: string, maxReplies = 60): Promise<Thread> {
  let item = await fetchJson<Item>(`${BASE}/items/${encodeURIComponent(id)}`);
  let title = item.title ?? undefined;
  let text = htmlToText(item.text ?? "");
  // A comment alone has no context: read it, then show the story's discussion around it.
  if (item.type === "comment" && item.story_id && String(item.story_id) !== id) {
    const story = await fetchJson<Item>(`${BASE}/items/${item.story_id}`);
    title = story.title ?? undefined;
    text = `${text}\n\n[in thread: ${story.title ?? ""}]${story.text ? `\n${htmlToText(story.text)}` : ""}`;
    item = { ...story, children: (story.children ?? []).filter((c) => String(c.id) !== id) };
  }
  const replies: Thread["replies"] = [];
  const walk = (nodes: Item[] | undefined, depth: number) => {
    for (const n of nodes ?? []) {
      if (replies.length >= maxReplies) return;
      if (n.text) replies.push({ author: n.author ?? undefined, text: htmlToText(n.text), createdAt: n.created_at });
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
    replies,
  };
}
