// Discourse forums through their public search API (`/search.json`), the same endpoint the forum's
// own search box uses. Thousands of communities run Discourse (product forums, teacher and maker
// communities…). Callers pass the forum domains to search; we honour robots.txt for each.
//
// Probed 12 Nov 2026 on 40 forums: Discourse's default robots.txt disallows /search, so search is
// refused on nearly all of them (1 of 40 allowed it). Reading a topic (/t/<id>.json) is allowed.
// In practice: discover threads through web search, read them with getDiscourseThread.
import { fetchJson, htmlToText } from "../http.js";
import { assertPublicUrl, robotsAllows } from "../page.js";
import type { Complaint, SearchOptions, SourceResult, Thread } from "../types.js";

interface SearchPost {
  id: number;
  topic_id: number;
  post_number: number;
  username?: string;
  created_at?: string;
  like_count?: number;
  blurb?: string;
}
interface SearchTopic {
  id: number;
  title: string;
  slug: string;
  posts_count?: number;
  like_count?: number;
}

function clean(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
}

export async function searchDiscourse(query: string, opts: SearchOptions & { domains: string[] }): Promise<SourceResult> {
  const items: Complaint[] = [];
  const notes: string[] = [];
  if (!opts.domains.length) return { source: "discourse", query, items, notes: ["No Discourse domains given (pass discourse_domains)."] };
  const perForum = Math.max(5, Math.ceil((opts.limit ?? 25) / opts.domains.length));
  for (const raw of opts.domains) {
    const domain = clean(raw);
    try {
      const url = `https://${domain}/search.json?${new URLSearchParams({ q: query })}`;
      await assertPublicUrl(url);
      if (!(await robotsAllows(url))) {
        notes.push(`${domain}: robots.txt disallows search; skipped.`);
        continue;
      }
      const data = await fetchJson<{ posts?: SearchPost[]; topics?: SearchTopic[] }>(url, { retries: 1, redirect: "error" });
      const topics = new Map((data.topics ?? []).map((t) => [t.id, t]));
      const since = opts.sinceDays ? Date.now() - opts.sinceDays * 86400_000 : 0;
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
          comments: t?.posts_count,
        });
      }
      notes.push(`${domain}: ${n} posts`);
    } catch (e) {
      notes.push(`${domain}: not a reachable Discourse forum (${(e as Error).message.slice(0, 80)})`);
    }
  }
  notes.push("Discourse search returns excerpts: open the topic with get_thread before quoting.");
  return { source: "discourse", query, items, notes };
}

/** id is "domain:topic_id:post_number". Returns the topic's posts. */
export async function getDiscourseThread(id: string): Promise<Thread> {
  const [domain, topicId, postNumber] = id.split(":");
  if (!domain || !topicId) throw new Error(`Discourse id must look like "forum.example.com:123:4", got "${id}"`);
  const url = `https://${domain}/t/${topicId}.json`;
  await assertPublicUrl(url);
  if (!(await robotsAllows(url))) throw new Error(`robots.txt of ${domain} disallows this topic.`);
  const data = await fetchJson<{
    title: string;
    slug: string;
    post_stream: { posts: { username?: string; cooked?: string; like_count?: number; created_at?: string; post_number: number }[] };
  }>(url, { redirect: "error" });
  const posts = data.post_stream.posts;
  const target = posts.find((p) => String(p.post_number) === postNumber) ?? posts[0];
  return {
    id: `dc:${id}`,
    source: "discourse",
    url: `https://${domain}/t/${data.slug}/${topicId}/${target?.post_number ?? 1}`,
    title: data.title,
    text: htmlToText(target?.cooked ?? ""),
    replies: posts
      .filter((p) => p !== target)
      .map((p) => ({ author: p.username, text: htmlToText(p.cooked ?? ""), engagement: p.like_count, createdAt: p.created_at })),
  };
}
