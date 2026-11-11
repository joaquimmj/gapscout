// Bluesky via its public AppView API (no key). Bluesky invites automated access through its
// protocol API rather than crawling the website: https://bsky.app/robots.txt · https://docs.bsky.app
// Many communities that left X (teachers, scientists, indie devs) post here.
import { fetchJson } from "../http.js";
import type { Complaint, SearchOptions, SourceResult, Thread } from "../types.js";

const BASE = "https://api.bsky.app/xrpc";

interface Post {
  uri: string;
  author: { handle: string; displayName?: string };
  record: { text?: string; createdAt?: string; langs?: string[] };
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
  quoteCount?: number;
  indexedAt?: string;
}

/** at://did/app.bsky.feed.post/rkey → https://bsky.app/profile/handle/post/rkey */
function postUrl(p: Post): string {
  const rkey = p.uri.split("/").pop();
  return `https://bsky.app/profile/${p.author.handle}/post/${rkey}`;
}

export async function searchBluesky(query: string, opts: SearchOptions & { sort?: "top" | "latest" }): Promise<SourceResult> {
  const params = new URLSearchParams({
    q: query,
    limit: String(Math.min(opts.limit ?? 25, 100)),
    sort: opts.sort ?? "top",
    lang: opts.lang,
  });
  if (opts.sinceDays) params.set("since", new Date(Date.now() - opts.sinceDays * 86400_000).toISOString());
  const data = await fetchJson<{ posts: Post[]; hitsTotal?: number }>(`${BASE}/app.bsky.feed.searchPosts?${params}`, { ttl: 6 * 3600 });
  const items: Complaint[] = data.posts
    .filter((p) => (p.record.text ?? "").length >= 40)
    .map((p) => ({
      id: `bs:${p.uri.replace("at://", "")}`,
      source: "bluesky",
      url: postUrl(p),
      title: `@${p.author.handle}`,
      text: p.record.text ?? "",
      author: p.author.handle,
      createdAt: p.record.createdAt ?? p.indexedAt,
      engagement: (p.likeCount ?? 0) + (p.repostCount ?? 0) + (p.quoteCount ?? 0),
      comments: p.replyCount,
    }));
  return {
    source: "bluesky",
    query,
    items,
    notes: [
      `${data.hitsTotal ?? items.length} Bluesky posts match (keyword search: expect noise, keep only first-person problems).`,
    ],
  };
}

interface ThreadNode {
  post?: Post;
  replies?: ThreadNode[];
}

/** id is "did:…/app.bsky.feed.post/rkey" (the part after "bs:"). */
export async function getBlueskyThread(id: string): Promise<Thread> {
  const uri = `at://${id}`;
  const data = await fetchJson<{ thread: ThreadNode }>(
    `${BASE}/app.bsky.feed.getPostThread?${new URLSearchParams({ uri, depth: "3" })}`,
  );
  const root = data.thread.post;
  if (!root) throw new Error(`Bluesky post not found: ${uri}`);
  const replies: Thread["replies"] = [];
  const walk = (nodes?: ThreadNode[]) => {
    for (const n of nodes ?? []) {
      if (n.post?.record.text)
        replies.push({
          author: n.post.author.handle,
          text: n.post.record.text,
          engagement: n.post.likeCount,
          createdAt: n.post.record.createdAt,
        });
      walk(n.replies);
    }
  };
  walk(data.thread.replies);
  return { id: `bs:${id}`, source: "bluesky", url: postUrl(root), title: `@${root.author.handle}`, text: root.record.text ?? "", replies };
}
