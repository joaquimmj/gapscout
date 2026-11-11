// GitHub issue search (REST). Works without a token (10 searches/min); a free token
// (GITHUB_TOKEN or GH_TOKEN) raises that to 30/min. Terms: https://docs.github.com/en/site-policy
import { fetchJson } from "../http.js";
import type { Complaint, SearchOptions, SourceResult, Thread } from "../types.js";

const BASE = "https://api.github.com";

function headers(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface Issue {
  number: number;
  title: string;
  body?: string | null;
  html_url: string;
  repository_url: string;
  user?: { login?: string };
  created_at: string;
  comments: number;
  reactions?: { total_count?: number };
}

export async function searchGitHub(query: string, opts: SearchOptions): Promise<SourceResult> {
  let q = `${query} is:issue`;
  if (opts.sinceDays) {
    const d = new Date(Date.now() - opts.sinceDays * 86400_000).toISOString().slice(0, 10);
    q += ` created:>${d}`;
  }
  const params = new URLSearchParams({
    q,
    sort: "reactions",
    order: "desc",
    per_page: String(Math.min(opts.limit ?? 30, 100)),
  });
  const data = await fetchJson<{ total_count: number; items: Issue[] }>(`${BASE}/search/issues?${params}`, {
    headers: headers(),
  });
  const items: Complaint[] = data.items.map((i) => {
    const repo = i.repository_url.replace(`${BASE}/repos/`, "");
    return {
      id: `gh:${repo}#${i.number}`,
      source: "github",
      url: i.html_url,
      title: `[${repo}] ${i.title}`,
      text: (i.body ?? "").replace(/<!--[\s\S]*?-->/g, "").trim(),
      author: i.user?.login,
      createdAt: i.created_at,
      engagement: i.reactions?.total_count,
      comments: i.comments,
    };
  });
  const notes = [`${data.total_count} matching issues on GitHub`];
  if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN)
    notes.push("Tip: set GITHUB_TOKEN for higher search limits (10/min unauthenticated).");
  return { source: "github", query, items, notes };
}

/** id is "owner/repo#number". */
export async function getGitHubThread(id: string): Promise<Thread> {
  const m = /^([^/]+\/[^#]+)#(\d+)$/.exec(id);
  if (!m) throw new Error(`GitHub id must look like "owner/repo#123", got "${id}"`);
  const [, repo, num] = m;
  const issue = await fetchJson<Issue>(`${BASE}/repos/${repo}/issues/${num}`, { headers: headers() });
  const comments = await fetchJson<{ body?: string; user?: { login?: string }; created_at: string; reactions?: { total_count?: number } }[]>(
    `${BASE}/repos/${repo}/issues/${num}/comments?per_page=50`,
    { headers: headers() },
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
      createdAt: c.created_at,
    })),
  };
}
