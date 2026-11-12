# gapscout · Buchhaltung für Freelancer

_Erstellt am 2026-11-11 · Quellen: Bluesky, App Store (1–3★), Foren (gutefrage, finanzfrage, foerderland), Hacker News, GitHub · Score = Häufigkeit × Intensität × Nachfrage × SERP-Schwäche (je 1–5), auf 0–100 (50 = alle Faktoren bei 3/5). ✓ = Zitat aus der API der Quelle übernommen oder auf der Seite geprüft._

| # | Chancen | Score | F | I | D | S |
|---|---|---|---|---|---|---|
| 1 | Wechselwillige nach Preiserhöhungen: Preisgarantie plus Umzug ohne Datenverlust | **62** | 4 | 4 | 3 | 3 |
| 2 | Zwischen teurem Steuerberater und reinem Do-it-yourself | **48** | 3 | 3 | 4 | 2 |

**Grenzen dieses Scans**

- Reddit wurde nicht genutzt (kein DataForSEO-Schlüssel): Deutschsprachige Beschwerden, etwa aus r/selbststaendig, fehlen in dieser Stichprobe.
- Gratis-Modus: Die Nachfrage ist über Google-Autocomplete geschätzt (Proxy, keine Suchvolumina), die SERP stammt aus Claudes Websuche. Diese Websuche ist nicht auf Deutschland lokalisiert; teils erscheinen ausländische Verzeichnisse (Capterra/GetApp .ca/.it/.com.au) statt der deutschen SERP.
- Suchtiefe „normal“: 5 Suchanfragen pro Quelle.
- Zusammengeführt: Die Cluster „Funktionen nur in teureren Tarifen“ (3 Erwähnungen, Intensität 2, Nachfrage 2) und „Wechsel und Datenübernahme“ sind in „Wechselwillige nach Preiserhöhungen“ aufgegangen. Allein trugen sie nicht; zusammen beschreiben sie den Lock-in-Kreislauf „Preis drückt hinaus, Umzug hält fest“, der erst einen konkreten Ansatz liefert.
- Prüfung der Belege: Alle Belege außer den Forenzitaten stammen aus APIs (HN, Bluesky, App Store, GitHub) und sind als „api“ markiert. Die Forenbelege (gutefrage.net und finanzfrage.net mit HTTP 403, forum.foerderland.de nicht erreichbar) ließen sich nicht prüfen und sind als „snippet“ markiert; es sind ausschließlich Fragetitel ohne Schmerzaussage. Entfernt wurden ein themenfremder HN-Beleg (US-Sales-Tax-Anfrage eines SaaS-Betreibers) sowie zwei Belege zur Belegerfassung, die nicht vom Problem handeln.
- SERP-Einschätzung „Wechselwillige nach Preiserhöhungen“: Der Werkzeug-Score war aufgebläht, weil Capterra- und GetApp-Verzeichnisse als Foren gezählt wurden. Anbieter (Norman, sevDesk, Lexware, kostenlose-erechnung.de) zielen aktiv auf „X alternative“; deshalb auf 3 gesenkt.
- Kein vom Clustering verworfener Cluster wurde wiederbelebt: Alle beruhen auf 1–2 Erwähnungen oder betreffen ein einziges Produkt (meist Kontist).
- Nur 2 von 9 Clustern überleben, beide mit mittlerer Zuversicht. Der Markt ist dicht besetzt (Lexware Office mit über 500.000 Nutzern, sevDesk, Accountable, Norman, Papierkram, BuchhaltungsButler, Kontist), und jeder Teilschmerz hat bereits einen Anbieter. Das Urteil würde sich ändern mit (a) echten Suchvolumina über DataForSEO für „lexoffice alternative“ und „steuerberater online selbstständige“, (b) lesbaren Threads aus r/selbststaendig und gutefrage statt nur Snippets, (c) einer engeren Zielgruppe wie Freelancern mit EU- oder Drittland-Kunden (Reverse Charge, OSS), wo die Standard-Tools nachweislich schwächeln (ein sevDesk-Beleg zu Abschlagsrechnungen an Auslandskunden im verworfenen UStVA-Cluster). Dafür fehlen in diesem Lauf aber Belege.
- Inhalts-Ansätze statt Produkt: Zu UStVA vergessen/korrigieren, Softwarevergleich und Steuerberater-Kosten gibt es Ratgeber-Nachfrage. Sie passt eher zu einer SEO- oder Affiliate-Seite als zu neuer Software.

## 1. Wechselwillige nach Preiserhöhungen: Preisgarantie plus Umzug ohne Datenverlust — Score 62/100

> Lexware Office, sevDesk und Kontist erhöhen die Preise (z. B. 145 auf 299 €, zweimal in 12 Monaten), Kündigungsfristen lösen ein weiteres Jahr Kosten aus, und Basisfunktionen stecken in teureren Tarifen. Wer deshalb wechseln will, stößt beim Umzug auf Importfehler (Stornos als 'Unklar', fehlende Belegdateien). Der Lock-in kommt also aus zwei Richtungen: Preise drücken die Nutzer hinaus, und der Datenumzug hält sie fest.

**Wer:** Solo-Freelancer und Kleinunternehmer mit sevDesk, Lexware Office oder Kontist in Einsteigertarifen

**Lücke:** Alternativen werben mit 'günstiger', aber keine bietet eine vertragliche Preisgarantie für Bestandskunden plus einen verlässlichen Umzug inklusive Belegdateien und Stornos aus sevDesk/Lexware. Inhaltlich gibt es außerdem einen Ansatz mit ehrlichen Preisentwicklungs- und Kündigungs-Ratgebern.

| Häufigkeit | Intensität | Google-Nachfrage | SERP-Schwäche |
|---|---|---|---|
| **4/5** 9 Erwähnungen (Bluesky, App Store, HN) bei 3 Produkten = Stufe 3, +1 für 3 Quellen — skeptic: hält; alle Zitate von verschiedenen Personen, Bluesky-Posts aus Juni/Sept. 2025, also aktuell und keine Einzel-Episode. Tarifgrenzen und Umzugsfehler aus zwei zusammengeführten Clustern eingemischt, ohne die Stufe zu erhöhen (GitHub-Issues sind Titel aus einem einzigen Open-Source-Projekt). | **4/5** Reale Mehrkosten (ein Jahr Abo für ungenutzte Software, Verdopplung des Preises), Wechselbereitschaft, Wut ('Weil wir es können') — skeptic: hält; es geht um Geldverlust, nicht nur Ärger. Der HN-Beleg stammt aber von jemandem, der ein eigenes Tool baut (Eigeninteresse). | **3/5** ~26 relevante Autocomplete-Vorschläge (Proxy, keine Volumina) — skeptic: 4 → 3. Den Großteil machen navigationale Bestandskunden-Suchen aus ('sevdesk kündigen', 'lexoffice preise'), die beim Anbieter landen. Kaufabsicht zeigt nur der Cluster 'lexoffice/sevdesk alternative (kostenlos)', und 'lexoffice preiserhöhung' liefert 1 Treffer. | **3/5** Tool 4 → 4 (Validator) — skeptic: 4 → 3. Selbst geprüft: Der US-WebSearch für 'lexoffice alternative' zeigt Capterra/GetApp-Verzeichnisse aus fremden Ländern, weil die Suche nicht lokalisiert ist. Das sind keine Foren und keine Schwäche-Signale. Direkt dahinter zielen Anbieter gezielt auf das Keyword (norman.finance mit zwei Seiten, kostenlose-erechnung.de, erfahrungen.com, sevdesk.de/lexoffice-alternative, lexware.de/sevdesk-alternative). In Deutschland ist die Kaufabsicht-SERP also eher umkämpft; offen bleibt nur, dass keine Seite den Umzug samt Datenübernahme konkret löst. |

**Belege**

- “Die Preisentwicklung bei #lexware hat bestimmt nur mit den steigenden Rohstoffpreisen zu tun. Letztes Jahr 145 dieses Jahr 299 momentan.” — [bluesky](https://bsky.app/profile/gofollow.freiburg.social.ap.brid.gy/post/3lyslkwch5zo2) ✓
- “wir erhöhen mal eben schon wieder um 10%. Weil wir es können. Du bist ja gebunden, lieber Kunde.” — [bluesky](https://bsky.app/profile/aengelhorn.eurosky.social/post/3lrubzl54k223) ✓
- “Nie benutzt und ich muss 1 Jahr bezahlen. Weil ich etwas zu spät gekündigt habe. Kundendienst stur und nicht zu überzeugen.” — [appstore](https://apps.apple.com/de/app/lexware/id622526440?see-all=reviews) ✓
- “Du schließt nur ein Monatsabo ab, aber man wird absichtlich in eine Abo Falle geführt. Man muss jedesmal kündigen 14 Tage vorher, damit sich nicht stillschweigend das Abonnement verlängert und dir Kosten entstehen.” — [appstore](https://apps.apple.com/de/app/sevdesk-buchhaltung-rechnung/id731738076?see-all=reviews) ✓
- “Wurde mit einem Preis gelockt und hab innerhalb von 12 Monaten 2 Preiserhöhungen erhalten. Zusätzlich wurden Sachen in Rechnung gestellt, die eigentlich Teil des Paket waren” — [appstore](https://apps.apple.com/de/app/kontist-by-shine/id1077414644?see-all=reviews) ✓
- “existing tools either ignore the German tax system or charge too much for basic features.” — [hn](https://news.ycombinator.com/item?id=47311008) ✓
- “Was mich etwas stört ist, dass nicht alle Konten zum verbuchen in der S-Version freigeschalten sind.” — [appstore](https://apps.apple.com/de/app/lexware/id622526440?see-all=reviews) ✓
- “Das geht nicht, das müssen Sie mit der großen Version machen.” — [bluesky](https://bsky.app/profile/yoran.com/post/3mpnq5o53uc2j) ✓
- “sevDesk-Umzug: Stornos als „Unklar“, Ausgaben 0 € im Jahresabgleich” — [github](https://github.com/firsttris/haben/issues/472) ✓
- “Umzug aus Papierkram.de über die Schnittstelle” — [github](https://github.com/firsttris/haben/issues/416) ✓

**Google-Keywords:** `lexoffice alternative`, `lexoffice alternative kostenlos`, `sevdesk alternative kostenlos`, `lexware office kostenlose alternative`, `lexoffice preiserhöhung`, `sevdesk kündigen`, `sevdesk export`, `buchhaltungssoftware wechseln`, `günstige buchhaltungssoftware kleinunternehmer`

**Bestehende Lösungen:** Norman (norman.finance, ohne Abo), Papierkram (Gratis-Tarif), kostenlose-erechnung.de, Accountable (3 Monate gratis bei Wechsel), BuchhaltungsButler, Lexware Office, sevDesk, haben (Open Source, Importer für sevDesk/Papierkram)

**Produktidee:** Ein Umzugs-Assistent für Freelancer, die sevDesk oder Lexware Office nach einer Preiserhöhung verlassen wollen: Export hochladen, das Tool überträgt Rechnungen, Stornos und Belegdateien vollständig in das Zielprogramm (zum Start Papierkram und Norman) und belegt per Jahresabgleich, dass alle Summen übereinstimmen. Anders als die Wechsel-Landingpages der Anbieter und der Open-Source-Importer von haben garantiert es einen geprüften, vollständigen Umzug inklusive Belegen und verkauft ihn zum Festpreis (z. B. 49 € einmalig) statt im Abo. Akquise: mit einem kostenlosen Kündigungsfristen- und Preisvergleichsrechner auf „sevdesk kündigen“, „lexoffice preiserhöhung“ und „sevdesk export“ ranken und dort den Umzug anbieten.

**Anmerkungen des Skeptikers**

- Läuft schnell auf 'günstigere Buchhaltungssoftware' hinaus, einen überfüllten Markt mit Gratis-Angeboten (Norman, Papierkram, kostenlose-erechnung.de). Ohne den Umzug-plus-Preisgarantie-Ansatz ist das keine Chance.
- Eine Preisgarantie ist ein Positionierungsversprechen, das ein Neuling erst finanzieren muss; die Margen bei 10–25 €/Monat sind dünn.
- Den Umzugsschmerz belegen nur GitHub-Issues eines Open-Source-Projekts. Wie verbreitet er bei Endnutzern ist, ist nicht belegt.
- sevDesk gehört seit 2025 zu Cegid, Lexware ist Haufe: Beide können mit Rabatten zur Kundenbindung kontern.

## 2. Zwischen teurem Steuerberater und reinem Do-it-yourself — Score 48/100

> Selbstständige zahlen dem Steuerberater 100 € und mehr pro Monat, oft nur fürs Übermitteln ans Finanzamt, und sitzen trotzdem wochenlang an der Unterlagen-Zusammenstellung. Viele fragen, ob sie ohne Berater auskommen, trauen sich das volle Do-it-yourself aber nicht zu.

**Wer:** Freelancer und Freiberufler mit EÜR, die heute einen klassischen Steuerberater bezahlen

**Lücke:** Die einfachen Fälle decken Accountable und Taxfix bereits ab. Offen ist allenfalls das Segment 'Freelancer mit USt und Auslandskunden', das sich Do-it-yourself nicht zutraut. Ihm fehlt ein jährlicher Steuerberater-Review zum Festpreis auf Basis der selbst gemachten Buchhaltung; der Bedarf ist unbelegt und muss erst validiert werden.

| Häufigkeit | Intensität | Google-Nachfrage | SERP-Schwäche |
|---|---|---|---|
| **3/5** 6 Erwähnungen (Bluesky, Foren, HN) = Stufe 3, +1 für 3 verschiedene Quellen — skeptic: 4 → 3. Nur 3 Belege sind tatsächlich lesbar (1× HN, 2× Bluesky von 2024 und 2025, verschiedene Personen). Die 3 Forenfragen sind nicht prüfbare Snippets (gutefrage 403, foerderland nicht erreichbar) und reine Titelfragen ohne Schmerzaussage. | **3/5** Laufende Kosten von 100 €+/Monat plus 'wochenlang' Aufwand — skeptic: 4 → 3. Die Kostenklage stammt nur von einer Person (HN, UG-Gründer, also nicht einmal klassischer Freelancer). Die übrigen Belege sind Fragen oder leichter Ärger; eine Wechselentscheidung wird nicht belegt. | **4/5** 11 relevante Autocomplete-Vorschläge (Proxy) — skeptic: hält bei 4, mit Vorbehalt. Es dominieren Kosten-Recherchen (informational); Produktabsicht ('ohne steuerberater', 'steuerberater freiberufler online') machen nur etwa 4 von 11 aus. | **2/5** Tool 2 → 3 (Validator) — skeptic: 3 → 2. Selbst geprüft: Die Top 5 für 'steuerberater kosten selbstständig' sind starke Anbieter-Ratgeber (firma.de, sevdesk ×2, Accountable ×2), danach folgen Kostenrechner (integral.de) und Online-Steuerberater (taxtify, onlinebilanz, norman). Das ist ein informationaler Begriff in einer gesättigten SERP; beim Kaufbegriff 'steuerberater online selbstständige' konkurrieren bereits mehrere Online-Kanzleien mit Festpreisen. |

**Belege**

- “it really hurts having to pay a tax advisor 100+ euro/month, mostly just to upload some data to the Finanzamt” — [hn](https://news.ycombinator.com/item?id=44714455) ✓
- “Dennoch sitze ich wochenlang da um alle Unterlagen und Infos für den Steuerberater für die Steuererklärung fertig zu machen.” — [bluesky](https://bsky.app/profile/nattys1.bsky.social/post/3m4vcjbotuk2m) ✓
- “Steuerbüro nervt auch herum, die Buchhaltung würde nicht richtig an die vom Vorjahr passen.” — [bluesky](https://bsky.app/profile/grafikervonost.bsky.social/post/3kip2af4qj22y) ✓
- “Steuererklärung: Sinnvoll das n Steuerberater machen zu lassen, oder kann man das selber? (1200€ /M)” — [forum](https://www.gutefrage.net/frage/steuererklaerung-sinnvoll-das-n-steuerberater-machen-oder-kann-man-das-selber-1200-m) (Suchausschnitt)
- “Zukünftig ohne Steuerberater auskommen als Einzelunternehmer” — [forum](https://forum.foerderland.de/steuern-finanzamt-buchhaltung-f26/zukuenftig-ohne-steuerberater-auskommen-als-einzel-t16720.html) (Suchausschnitt)
- “Brauche ich als Selbstständiger zwingend einen Steuerberater?” — [forum](https://www.gutefrage.net/frage/brauche-ich-als-selbststaendiger-zwingend-einen-steuerberater) (Suchausschnitt)

**Google-Keywords:** `steuerberater kosten selbstständig`, `steuerberater kosten rechner selbstständig`, `steuerberater freiberufler online`, `selbstständig ohne steuerberater`, `buchhaltung ohne steuerberater`, `buchhaltung selber machen ohne steuerberater`

**Bestehende Lösungen:** Accountable (inkl. 'KI-Steuerberater' und Festpreis-Beratung), Taxfix Experten-Service, Norman, WISO Steuer / SteuerSparErklärung Selbstständige, Online-Kanzleien (taxtify, onlinebilanz.de, integral), DATEV Unternehmen online (Belegübergabe an bestehenden Berater)

**Produktidee:** Ein jährlicher Festpreis-Check für Freelancer, die ihre EÜR selbst machen: Export aus Lexware Office, sevDesk oder einer Tabelle hochladen, eine Checkliste prüft Vollständigkeit und typische Fehler (Umsatzsteuer, Reverse Charge bei Auslandskunden), danach prüft und übermittelt eine Partnerkanzlei zum Festpreis (z. B. 290 € pro Jahr statt 100 € pro Monat). Anders als Accountable und Taxfix setzt es keine eigene Software voraus und zielt auf Freelancer mit Auslandskunden, die sich reines Do-it-yourself nicht zutrauen. Akquise: mit einem kostenlosen Steuerberater-Kostenrechner auf „steuerberater kosten selbstständig“ und „selbstständig ohne steuerberater“ ranken und den Festpreis-Check als Upsell anbieten.

**Anmerkungen des Skeptikers**

- Das Kernversprechen 'ohne/billiger als Steuerberater' bedienen gut bekannte, günstige Produkte schon (Accountable, Taxfix, Norman); ein Neuling bräuchte einen deutlich schärferen Ansatz.
- Die Evidenz ist dünn: nur 3 lesbare Belege, die stärkste Kostenklage von einer einzigen Person (UG statt Freelancer).
- Steuerberatung ist regulierter Markt (StBerG). Ein Hybrid-Modell braucht Partnerkanzleien, was Margen und Skalierung begrenzt.
- Die Suchnachfrage ist überwiegend informational ('was kostet …'); daraus folgt eher ein Inhalts- oder Affiliate-Spiel als ein Produktkauf.

## Vom Skeptiker verworfen

- **Belege per Handy erfassen klappt nicht zuverlässig** — Es sind Bugs bei den Anbietern (Lexware Office, sevDesk), kein Marktloch. Für 'belege scannen app' existieren zahlreiche gute Lösungen (Candis, GetMyInvoices, Klippa, Pleo, DATEV Upload mobil, Accountable, BuchhaltungsButler), und die SERP gehört Marken (Amex, PayPal, Pleo). Zwei Belege entfernt: Der GitHub-Titel 'OCR-Integration' ist ein Feature-Wunsch in einem Open-Source-Projekt, und 'App hat nur einen kleinen Teil der Funktionen' handelt nicht vom Beleg-Upload. Übrig bleiben 4 Bewertungen zu 2 Apps.
- **Umsatzsteuervoranmeldung falsch, doppelt oder vergessen** — Nach Entfernen des themenfremden HN-Belegs (US-Sales-Tax-Anfrage eines SaaS-Betreibers) bleiben 3 Personen. Jede Buchhaltungssoftware bietet UStVA per ELSTER samt Fristerinnerung. Die Nachfrage ist zu etwa 2/3 Ratgeber-Suche ('vergessen was tun', 'Strafe'), und Finanzamt plus Anbieter besitzen die SERP. Das ist ein Inhalts-Spiel, kein Produkt.
- **Buchhaltungs-Apps instabil: Login, Abstürze, Export** — Nur eine Quelle (App Store); es geht um Support-Fälle der Anbieter. Die Suchen ('sevdesk app funktioniert nicht') sind navigational und nützen dem Anbieter, nicht einer Alternative. 'Eine App, die nicht abstürzt' ist kein eigenständiger Ansatz.
- **Abschlagsrechnung, Lieferschein, Storno und Mahnwesen fehlen** — Bereits gelöst: Lexware Office, Papierkram und easybill haben eigene Funktionsseiten für Abschlagsrechnungen und Mahnungen, die die SERP besitzen. Der Schmerz betrifft vor allem sevDesk. Zwei der vier Belege sind GitHub-Feature-Wünsche an Entwickler-Projekte (haben, eine Lexware-PHP-API), nicht Endnutzer-Schmerz.
- **Softwareauswahl überfordert Gründer und Freelancer** — Banal und mit niedriger Intensität (2): Ratlosigkeit vor der Auswahl ohne Schaden. Die SERP gehört gepflegten Vergleichsportalen von 2026 (drweb, freelancermap, Papierkram, Qonto). Bestenfalls ein Affiliate- oder Inhalts-Spiel, kein Produkt. 3 der 6 Belege sind nicht prüfbare Snippets.

---
_Made with [gapscout](https://github.com/joaquimmj/gapscout) — find problems worth building._
