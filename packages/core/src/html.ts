// A single self-contained HTML file for sharing a report: no scripts, no external assets.
// Report text comes from web pages and LLMs, so everything is escaped and links are http(s) only.
import { L, withScores } from "./report.js";
import type { Opportunity, Report, Score } from "./types.js";

const h = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Only http(s) links are rendered as links; anything else (javascript:, data:) becomes "#". */
const href = (url: string) => (/^https?:\/\//i.test(url) ? h(url) : "#");

const CSS = `
:root{--bg:#fff;--fg:#1a1d23;--muted:#5b6472;--line:#e3e6ea;--card:#f7f8fa;--accent:#b45309;--good:#15803d}
@media (prefers-color-scheme:dark){:root{--bg:#111827;--fg:#e5e7eb;--muted:#9ca3af;--line:#283041;--card:#182132;--accent:#facc15;--good:#4ade80}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:860px;margin:0 auto;padding:32px 16px 64px}
h1{font-size:1.7rem;margin:0 0 4px}h2{font-size:1.25rem;margin:0 0 8px}
.meta,.why,footer{color:var(--muted);font-size:.875rem}a{color:inherit}
table{width:100%;border-collapse:collapse;margin:20px 0}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.score{font-weight:700;color:var(--accent)}
.warn{border-left:3px solid var(--accent);padding:8px 12px;background:var(--card);margin:16px 0}
section{border:1px solid var(--line);border-radius:12px;padding:20px;margin:24px 0}
blockquote{margin:8px 0 16px;padding-left:12px;border-left:3px solid var(--line)}
.factors{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:16px 0}
.factor{background:var(--card);border-radius:8px;padding:10px}.factor b{display:block}
ul{padding-left:20px}li{margin:6px 0}.ok{color:var(--good)}code{background:var(--card);padding:1px 5px;border-radius:4px;font-size:.875em}
.label{font-weight:600}footer{margin-top:40px;text-align:center}
`;

function factor(label: string, s: Score): string {
  return `<div class="factor"><b>${h(label)} · ${s.value}/5</b><span class="why">${h(s.why)}</span></div>`;
}

function opportunity(o: Opportunity, i: number, t: Record<string, string>): string {
  const p: string[] = [];
  p.push(`<section><h2>${i + 1}. ${h(o.title)} <span class="score">${o.score ?? "?"}/100</span></h2>`);
  p.push(`<blockquote>${h(o.problem)}</blockquote>`);
  if (new Set(o.evidence.map((e) => e.source)).size < 3) p.push(`<p class="warn">⚠️ ${h(t.weakSignal)}</p>`);
  if (o.audience) p.push(`<p><span class="label">${h(t.audience)}:</span> ${h(o.audience)}</p>`);
  if (o.gap) p.push(`<p><span class="label">${h(t.gap)}:</span> ${h(o.gap)}</p>`);
  p.push(
    `<div class="factors">${factor(t.frequency!, o.frequency)}${factor(t.intensity!, o.intensity)}${factor(t.demand!, o.demand)}${factor(t.serp!, o.serpWeakness)}</div>`,
  );
  p.push(`<p class="label">${h(t.evidence)}</p><ul>`);
  for (const e of o.evidence) {
    const checked = e.verified && e.verified !== "snippet";
    const mark = checked ? ` <span class="ok" title="${h(t.method)}">✓</span>` : e.verified === "snippet" ? ` <span class="why">(${h(t.snippet)})</span>` : "";
    p.push(`<li>“${h(e.quote)}” — <a href="${href(e.url)}" rel="noopener nofollow">${h(e.source)}</a>${mark}</li>`);
  }
  p.push("</ul>");
  if (o.keywords.length)
    p.push(
      `<p><span class="label">${h(t.keywords)}:</span> ${o.keywords
        .map((k) => `<code>${h(k.keyword)}</code>${k.volume != null ? ` (${k.volume.toLocaleString("en-US")}/mo)` : ""}`)
        .join(", ")}</p>`,
    );
  if (o.competitors?.length) p.push(`<p><span class="label">${h(t.competitors)}:</span> ${h(o.competitors.join(", "))}</p>`);
  p.push(`<p><span class="label">${h(t.idea)}:</span> ${h(o.productIdea)}</p>`);
  if (o.risks?.length) p.push(`<p class="label">${h(t.risks)}</p><ul>${o.risks.map((r) => `<li>${h(r)}</li>`).join("")}</ul>`);
  p.push("</section>");
  return p.join("\n");
}

export function renderReportHtml(report: Report): string {
  const r = withScores(report);
  const t = L[r.lang] ?? L.en;
  const rows = r.opportunities
    .map(
      (o, i) =>
        `<tr><td class="n">${i + 1}</td><td>${h(o.title)}</td><td class="n score">${o.score}</td><td class="n">${o.frequency.value}</td><td class="n">${o.intensity.value}</td><td class="n">${o.demand.value}</td><td class="n">${o.serpWeakness.value}</td></tr>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="${h(r.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>gapscout · ${h(r.niche)}</title>
<style>${CSS}</style>
</head>
<body><main>
<h1>gapscout · ${h(r.niche)}</h1>
<p class="meta">${h(t.generated)} ${h(r.generatedAt.slice(0, 10))} · ${h(t.sources)}: ${h(r.sourcesUsed.join(", "))}</p>
<p class="meta">${h(t.method)}</p>
<table><thead><tr><th class="n">#</th><th>${h(t.title)}</th><th class="n">${h(t.score)}</th><th class="n" title="${h(t.frequency)}">F</th><th class="n" title="${h(t.intensity)}">I</th><th class="n" title="${h(t.demand)}">D</th><th class="n" title="${h(t.serp)}">S</th></tr></thead>
<tbody>
${rows}
</tbody></table>
${(r.opportunities[0]?.score ?? 0) < 50 ? `<p class="warn">⚠️ ${h(t.weak)}</p>` : ""}
${r.notes?.length ? `<p class="label">${h(t.notes)}</p><ul>${r.notes.map((n) => `<li>${h(n)}</li>`).join("")}</ul>` : ""}
${r.opportunities.map((o, i) => opportunity(o, i, t)).join("\n")}
${r.discarded?.length ? `<section><h2>${h(t.discarded)}</h2><ul>${r.discarded.map((d) => `<li><b>${h(d.title)}</b> — ${h(d.reason)}</li>`).join("")}</ul></section>` : ""}
<footer>Made with <a href="https://github.com/joaquimmj/gapscout">gapscout</a> — find problems worth building.</footer>
</main></body>
</html>
`;
}
