# Examples

## `reports/` — full `/gapscout` pipeline

Each report comes as `.md`, `.json` and a self-contained `.html` page (no scripts, light and dark mode) made for sharing.

- [`comptabilite-freelance-fr-2026-11-11.md`](reports/comptabilite-freelance-fr-2026-11-11.md) — `/gapscout "comptabilité freelance" --lang fr --depth quick`, free mode (no DataForSEO, so no Reddit and no volumes).

  44 complaints from the App Store, Services Publics+, Codeur job posts, forums, Hacker News and GitHub were grouped into 11 recurring problems, each demand-checked on Google. The skeptic kept **2**; every quote is checked against its source (✓).

  Read the "Écartées" section too: it is often the most useful part. Here it shows that the URSSAF-outage pain already has a workaround (the URSSAF Tierce Déclaration API) and that "no human support" is solved by Superindep and Dougs.

- [`tools-for-teachers-en-2026-11-11.md`](reports/tools-for-teachers-en-2026-11-11.md) — `/gapscout "tools for teachers" --lang en`, free mode.

  42 complaints from Bluesky, App Store reviews, web forums, HN and GitHub were grouped into 6 problems; the skeptic kept **2**:
  - a parent-messaging app with no family upsells and guaranteed delivery (the ClassDojo paywall wedge);
  - sub plans that carry the class context a substitute needs.

  The discarded list explains why roster sync (Clever, ClassLink) and report-card comments (free AI generators) are already taken.

- [`buchhaltung-fuer-freelancer-de-2026-11-11.md`](reports/buchhaltung-fuer-freelancer-de-2026-11-11.md) — `/gapscout "Buchhaltung für Freelancer" --lang de`, free mode. **The strongest of the three (62/100).**

  65 complaints from Bluesky, App Store reviews, forums, HN and GitHub were grouped into 9 problems; the skeptic kept **2**. The top one is freelancers pushed out of sevDesk and Lexware Office by price hikes ("Letztes Jahr 145 dieses Jahr 299") but held back by lossy data migration. The product idea is a fixed-price migration assistant that ranks on "sevdesk kündigen".

## `raw/` — CLI scans (no LLM)

Produced with `npx gapscout scan "<niche>" --lang <lang> --since 1095`: real quotes from public sources, grouped into n-gram themes when there is enough data, with Google Autocomplete demand per theme.

- [`invoicing-freelancers-en-raw.md`](raw/invoicing-freelancers-en-raw.md) — HN, Stack Exchange, GitHub, App Store
- [`comptabilite-freelance-fr-raw.md`](raw/comptabilite-freelance-fr-raw.md) — Stack Exchange, App Store
- [`buchhaltung-freelancer-de-raw.md`](raw/buchhaltung-freelancer-de-raw.md) — Stack Exchange, App Store

Outside English, most complaints live in forums and communities. The CLI can't search those without an LLM; the plugin's forums-scout does.
