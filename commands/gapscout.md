---
description: Find problems worth building in a niche — real complaints, validated by Google demand. Usage /gapscout "<niche>" [--lang fr|en|de|es|fr,en] [--depth quick|normal|deep] [--country fr]
argument-hint: "\"<niche>\" [--lang fr] [--depth normal] [--country fr]"
---

Run the gapscout pipeline for: $ARGUMENTS

Follow the `gapscout` skill's method. You are the orchestrator: you only dispatch sub-agents and pass their JSON along. Do not research yourself, and keep your own messages short — one line per step so the user can follow.

## 0. Parse arguments
- `niche`: the quoted text (or everything that isn't a flag).
- `--lang`: comma-separated among en, fr, de, es. Default: the language the niche is written in (en if unclear). The **first** language is the report language.
- `--depth`: quick | normal (default) | deep.
- `--country`: ISO-2, default fr for fr, de for de, es for es, us for en.
If the niche is missing, ask for it and stop.

## 1. Plan
Launch `gapscout:query-planner` with the niche, languages, depth and country. Keep its JSON plan.

## 2. Scout — in parallel
In a **single message**, launch all scouts at once (one Agent call each):
- for each language: `gapscout:forums-scout` with that language's `forums` plan (forum queries + subreddits), the lang and country;
- for each language: `gapscout:reviews-scout` with that language's `reviews` plan, the lang and country;
- one `gapscout:hn-dev-scout` with the `hn_dev` plans of all languages merged (HN/GitHub are mostly English), the report language as output language.
Depth quick: skip reviews-scout for secondary languages. Tell each scout the report language for its `pain` paraphrases.

## 3. Cluster
Launch `gapscout:clusterer` with every scout's JSON (pass them verbatim), the report language and the niche.

## 4. Validate demand — in parallel
Split the clusters into batches of 3–4. In a **single message**, launch one `gapscout:demand-validator` per batch, each with its clusters (id, title, problem, seed_keywords), the report language and country.
If several languages were requested, validate in the report language; mention in notes that other markets weren't volume-checked.

## 5. Skeptic
Merge each cluster with its validation by `id`. Launch `gapscout:skeptic` with the merged list and the niche.

## 6. Report
Launch `gapscout:reporter` with the skeptic's `kept`, `discarded` and `notes`, the niche, the report language, and `sources_used` (the scout sources that returned evidence, e.g. ["forums", "reddit (via DataForSEO)", "hn", "stackexchange", "github", "appstore", "trustpilot"]).

## 7. Answer the user
Show the reporter's summary table and file paths, then one short paragraph: the top opportunity and why, and what would make the next scan better. In the report language.

If fewer than 3 opportunities survived, say so plainly — a short honest report is a result — and name the levers, in order:
1. `--depth normal` or `deep`, which runs more queries per source;
2. a narrower audience, which gives sharper evidence;
3. `--lang fr,en`, since many founders complain in English;
4. DataForSEO keys, which add Reddit and real volumes.

If a step fails or returns nothing usable, say which and continue with what you have; never fabricate evidence to fill a gap.
