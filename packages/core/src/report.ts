// Markdown rendering for a Report, in the report's language. JSON is the source of truth; Markdown is the view.
import { opportunityScore } from "./scoring.js";
import type { Lang, Opportunity, Report } from "./types.js";

export const L: Record<Lang, Record<string, string>> = {
  en: {
    title: "Opportunities", generated: "Generated", sources: "Sources", score: "score", frequency: "Frequency",
    intensity: "Intensity", demand: "Google demand", serp: "SERP weakness", evidence: "Evidence", keywords: "Google keywords",
    idea: "Product idea", risks: "Skeptic's notes", audience: "Who", discarded: "Discarded by the skeptic",
    method: "Score = frequency × intensity × demand × SERP weakness (each 1–5), as 0–100 (50 = all factors at 3/5). ✓ = quote copied from the source's API or checked on the page.",
    snippet: "search snippet", weakSignal: "Weak signal: evidence from fewer than 3 independent sources.", gap: "Gap", competitors: "Existing solutions", notes: "Coverage notes", weak: "No strong opportunity in this scan (best score below 50/100, i.e. factors average under 3/5). Treat these as leads to dig into, not as validated bets.",
  },
  fr: {
    title: "Opportunités", generated: "Généré le", sources: "Sources", score: "score", frequency: "Fréquence",
    intensity: "Intensité", demand: "Demande Google", serp: "Faiblesse SERP", evidence: "Preuves", keywords: "Mots-clés Google",
    idea: "Idée de produit", risks: "Notes du sceptique", audience: "Qui", discarded: "Écartées par le sceptique",
    method: "Score = fréquence × intensité × demande × faiblesse SERP (chacun de 1 à 5), sur 0–100 (50 = tous les facteurs à 3/5). ✓ = citation copiée de l'API de la source ou vérifiée sur la page.",
    snippet: "extrait de recherche", weakSignal: "Signal faible : preuves issues de moins de 3 sources indépendantes.", gap: "Angle", competitors: "Solutions existantes", notes: "Limites de ce scan", weak: "Aucune opportunité forte dans ce scan (meilleur score sous 50/100, facteurs en moyenne sous 3/5) : ce sont des pistes à creuser, pas des paris validés.",
  },
  de: {
    title: "Chancen", generated: "Erstellt am", sources: "Quellen", score: "Score", frequency: "Häufigkeit",
    intensity: "Intensität", demand: "Google-Nachfrage", serp: "SERP-Schwäche", evidence: "Belege", keywords: "Google-Keywords",
    idea: "Produktidee", risks: "Anmerkungen des Skeptikers", audience: "Wer", discarded: "Vom Skeptiker verworfen",
    method: "Score = Häufigkeit × Intensität × Nachfrage × SERP-Schwäche (je 1–5), auf 0–100 (50 = alle Faktoren bei 3/5). ✓ = Zitat aus der API der Quelle übernommen oder auf der Seite geprüft.",
    snippet: "Suchausschnitt", weakSignal: "Schwaches Signal: Belege aus weniger als 3 unabhängigen Quellen.", gap: "Lücke", competitors: "Bestehende Lösungen", notes: "Grenzen dieses Scans", weak: "Keine starke Chance in diesem Scan (bester Score unter 50/100, Faktoren im Schnitt unter 3/5): Spuren zum Vertiefen, keine validierten Wetten.",
  },
  es: {
    title: "Oportunidades", generated: "Generado el", sources: "Fuentes", score: "puntuación", frequency: "Frecuencia",
    intensity: "Intensidad", demand: "Demanda en Google", serp: "Debilidad SERP", evidence: "Pruebas", keywords: "Palabras clave",
    idea: "Idea de producto", risks: "Notas del escéptico", audience: "Quién", discarded: "Descartadas por el escéptico",
    method: "Puntuación = frecuencia × intensidad × demanda × debilidad SERP (cada una 1–5), en 0–100 (50 = todos los factores en 3/5). ✓ = cita copiada de la API de la fuente o verificada en la página.",
    snippet: "fragmento de búsqueda", weakSignal: "Señal débil: pruebas de menos de 3 fuentes independientes.", gap: "Hueco", competitors: "Soluciones existentes", notes: "Límites de este análisis", weak: "Ninguna oportunidad fuerte en este análisis (mejor puntuación bajo 50/100, factores de media bajo 3/5): pistas para investigar, no apuestas validadas.",
  },
};

export function withScores(r: Report): Report {
  const opportunities = r.opportunities
    .map((o) => ({ ...o, score: opportunityScore(o.frequency, o.intensity, o.demand, o.serpWeakness).outOf100 }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return { ...r, opportunities };
}

function esc(s: string) {
  return s.replace(/\|/g, "\\|").replace(/\n+/g, " ");
}

function renderOpportunity(o: Opportunity, i: number, t: Record<string, string>): string {
  const lines: string[] = [];
  lines.push(`## ${i + 1}. ${o.title} — ${t.score} ${o.score ?? "?"}/100`, "");
  lines.push(`> ${o.problem.replace(/\n+/g, " ")}`, "");
  // A decent score built on one or two sources must not read as a validation.
  if (new Set(o.evidence.map((e) => e.source)).size < 3) lines.push(`⚠️ _${t.weakSignal}_`, "");
  if (o.audience) lines.push(`**${t.audience}:** ${o.audience}`, "");
  if (o.gap) lines.push(`**${t.gap}:** ${o.gap}`, "");
  lines.push(`| ${t.frequency} | ${t.intensity} | ${t.demand} | ${t.serp} |`, "|---|---|---|---|");
  lines.push(
    `| **${o.frequency.value}/5** ${esc(o.frequency.why)} | **${o.intensity.value}/5** ${esc(o.intensity.why)} | **${o.demand.value}/5** ${esc(o.demand.why)} | **${o.serpWeakness.value}/5** ${esc(o.serpWeakness.why)} |`,
    "",
  );
  lines.push(`**${t.evidence}**`, "");
  for (const e of o.evidence) {
    const mark = e.verified === "api" || e.verified === "exact" || e.verified === "close" || e.verified === "manual" ? " ✓" : e.verified === "snippet" ? ` (${t.snippet})` : "";
    lines.push(`- “${e.quote.replace(/\n+/g, " ")}” — [${e.source}](${e.url})${mark}`);
  }
  lines.push("");
  if (o.keywords.length) {
    const kws = o.keywords.map((k) => (k.volume != null ? `\`${k.keyword}\` (${k.volume.toLocaleString("en-US")}/mo)` : `\`${k.keyword}\``));
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

export function renderReport(report: Report): string {
  const r = withScores(report);
  const t = L[r.lang] ?? L.en;
  const out: string[] = [];
  out.push(`# gapscout · ${r.niche}`, "");
  out.push(`_${t.generated} ${r.generatedAt.slice(0, 10)} · ${t.sources}: ${r.sourcesUsed.join(", ")} · ${t.method}_`, "");
  out.push(`| # | ${t.title} | ${t.score} | F | I | D | S |`, "|---|---|---|---|---|---|---|");
  r.opportunities.forEach((o, i) =>
    out.push(`| ${i + 1} | ${esc(o.title)} | **${o.score}** | ${o.frequency.value} | ${o.intensity.value} | ${o.demand.value} | ${o.serpWeakness.value} |`),
  );
  out.push("");
  if ((r.opportunities[0]?.score ?? 0) < 50) out.push(`> ⚠️ ${t.weak}`, "");
  if (r.notes?.length) {
    out.push(`**${t.notes}**`, "");
    for (const n of r.notes) out.push(`- ${n}`);
    out.push("");
  }
  r.opportunities.forEach((o, i) => out.push(renderOpportunity(o, i, t)));
  if (r.discarded?.length) {
    out.push(`## ${t.discarded}`, "");
    for (const d of r.discarded) out.push(`- **${d.title}** — ${d.reason}`);
    out.push("");
  }
  out.push("---", "_Made with [gapscout](https://github.com/joaquimmj/gapscout) — find problems worth building._", "");
  return out.join("\n");
}
