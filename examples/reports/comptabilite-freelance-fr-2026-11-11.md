# gapscout · comptabilité freelance

_Généré le 2026-11-11 · Sources: App Store (avis 1–3★), forums & Services Publics+, Codeur (annonces), Hacker News, GitHub · Score = fréquence × intensité × demande × faiblesse SERP (chacun de 1 à 5), sur 0–100 (50 = tous les facteurs à 3/5). ✓ = citation copiée de l'API de la source ou vérifiée sur la page._

| # | Opportunités | score | F | I | D | S |
|---|---|---|---|---|---|---|
| 1 | Savoir à temps si l'on sort de la franchise de TVA (seuils de base, majoré, N/N-1) | **52** | 2 | 3 | 5 | 3 |
| 2 | Dirigeant solo en détresse : compta jamais tenue, dettes URSSAF/TVA, saisies | **24** | 1 | 5 | 3 | 1 |

**Limites de ce scan**

- Reddit n'a pas été consulté (pas de clé DataForSEO) : une partie des plaintes francophones, souvent postées là, manque à cet échantillon.
- Mode gratuit : demande mesurée par Google Autocomplete (pas de volumes), SERP issue de la recherche web de Claude.
- Profondeur « quick » : 3 requêtes par source. Relancer en --depth normal ou avec --lang fr,en élargira le filet.

## 1. Savoir à temps si l'on sort de la franchise de TVA (seuils de base, majoré, N/N-1) — score 52/100

> Les micro-entrepreneurs ne savent pas si et quand ils perdent la franchise en base de TVA : seuil de base ou majoré, règle sur deux années, activités mixtes, seuils qui changent selon la loi de finances. Même les réponses du forum, d'une comptable et des impôts divergent, et une erreur se découvre après coup, avec une TVA due mais jamais facturée.

**Qui:** Micro-entrepreneurs proches des seuils de TVA (CA entre ~30 k€ et ~100 k€), surtout prestataires de services et activités mixtes

**Angle:** Les guides et simulateurs donnent une photo statique. Aucun outil autonome ne suit le CA en continu en appliquant les règles réelles (seuil de base vs majoré, années N/N-1, activités mixtes, seuils de l'année en cours) et n'alerte avant le franchissement, avec la marche à suivre.

| Fréquence | Intensité | Demande Google | Faiblesse SERP |
|---|---|---|---|
| **2/5** 5 mentions (HN Portugal avec 1 écho, forum Previssima, 2 avis App Store), 3 sources — skeptic: -1. La citation « pas de support téléphonique… » est retirée (elle parle du support, pas de TVA). La citation HN concerne le Portugal (hors marché). Il reste un seul fil FR solide (Previssima) et 1 avis Indy. verify_quote a renvoyé not_found sur Previssima, mais c'est un faux négatif : la page encode les accents en entités HTML (&eacute;). Texte confirmé à la main via fetch_page. | **3/5** Erreurs silencieuses aux conséquences financières, mais peu de colère exprimée — skeptic: -1. Côté FR, on voit surtout de la confusion (réponses contradictoires entre forum, comptable et impôts) et aucune perte chiffrée. Le « 23 % de TVA jamais collectée » est un cas portugais. | **5/5** Proxy Autocomplete : 'franchise de tva' (~27 suggestions) et 'seuil tva micro-entrepreneur' (10) donnent plus de 30 suggestions pertinentes (seuil 2026, comment sortir/passer, quand facturer) — skeptic: maintenu. Mais l'intention est informationnelle (comprendre une règle), pas transactionnelle (acheter un outil). C'est un levier de contenu/SEO et d'acquisition plus qu'un produit payant en soi. | **3/5** Note outil 2, relevée à 3 : un fil de forum Previssima est n°1, un autre en n°7 ; le reste, ce sont des guides de cabinets ou d'éditeurs (Abby, Clementine, join-jump, Propulse by CA) — skeptic: maintenu. Un fil de forum en tête montre que la question précise (« suis-je encore en franchise ? ») reste mal servie par les guides génériques. Le seul outil interactif trouvé est le simulateur sum.money, sans alerte. |

**Preuves**

- “En 2023,il a déclaré un chiffre de 98972 euros avec une tolerance fixé a 101000 euros pour etre en franchise de TVA.” — [forum](https://www.previssima.fr/forum/statut-du-dirigeant/franchise-de-tva-auto-entrepreneur.html) ✓
- “J'ai posé la question a une comptable qui dit la meme chose que vous.” — [forum](https://www.previssima.fr/forum/statut-du-dirigeant/franchise-de-tva-auto-entrepreneur.html) ✓
- “Tous ça parce qu’on ne peux pas activer la TVA soit même” — [appstore](https://apps.apple.com/fr/app/indy-comptabilit%C3%A9-factures/id1627517694?see-all=reviews) ✓
- “The wrong selection in one dropdown can silently opt you into a 23% VAT regime you never collected from clients.” — [hn](https://news.ycombinator.com/item?id=47426732) ✓

**Mots-clés Google:** `franchise de tva seuil`, `franchise de tva auto entrepreneur`, `franchise de tva micro entreprise`, `comment sortir de la franchise de tva`, `seuil tva micro entrepreneur`, `seuil tva micro entrepreneur 2026`, `seuil tva micro entreprise prestation de service`, `seuil tva micro entreprise vente marchandise`, `quand facturer la tva micro entreprise`, `comment facturer la tva micro entreprise`

**Solutions existantes:** Abby, Indy, Clementine, Propulse by CA, sum.money (simulateur TVA), join-jump (guide), impots.gouv.fr

**Idée de produit:** Un traqueur de seuils de TVA gratuit pour micro-entrepreneurs : on importe son CA mensuel (CSV bancaire ou export Abby/Indy) et l'outil applique les vraies règles (seuil de base vs majoré, années N/N-1, activités mixtes, seuils de l'année en cours), puis envoie une alerte avant le franchissement avec la marche à suivre (date de bascule, mentions à ajouter sur les factures). Contrairement aux simulateurs statiques (sum.money) et aux guides (Abby, Clementine), il suit le CA dans le temps et reste indépendant du logiciel de facturation ; acquisition : se classer sur « seuil tva micro entrepreneur 2026 » et « comment sortir de la franchise de tva » avec le simulateur gratuit, puis monétiser les alertes ou la mise en relation avec un expert-comptable partenaire.

**Notes du sceptique**

- Les logiciels de facturation (Abby, Indy, Freebe…) affichent peut-être déjà une jauge de seuil : non vérifié. Si c'est le cas, l'outil devient une fonctionnalité, pas un produit.
- La demande est informationnelle et la volonté de payer des micro-entrepreneurs est faible : c'est plutôt un outil gratuit d'acquisition (SEO, lead-gen) qu'un SaaS payant.
- Les règles changent presque chaque année (lois de finances 2025-2026) : coût de maintenance et risque de responsabilité en cas de mauvais conseil.
- Preuve FR mince : un seul fil de forum vérifié, le reste est hors marché ou adjacent.

## 2. Dirigeant solo en détresse : compta jamais tenue, dettes URSSAF/TVA, saisies — score 24/100

> Des gérants d'EURL découvrent des années de comptabilité non tenue, des cotisations URSSAF jamais payées, une TVA en retard et des saisies sur compte. Ils ont besoin à la fois d'un rattrapage et d'une décision rapide (échéancier, redressement ou liquidation), et passent des annonces en urgence sur des plateformes de freelances.

**Qui:** Gérants d'EURL / SASU unipersonnelles en retard administratif grave, souvent sans expert-comptable

**Angle:** Les cabinets vendent le rattrapage par exercice, les consultants vendent des jours de négociation. Personne ne propose au dirigeant solo un parcours d'urgence au forfait qui enchaîne diagnostic des dettes et saisies, plan d'échéancier URSSAF/DGFiP et aide à décider redressement ou liquidation, puis l'oriente vers le bon professionnel.

| Fréquence | Intensité | Demande Google | Faiblesse SERP |
|---|---|---|---|
| **1/5** 2 annonces Codeur.com (projets clos avec 5 et 12 offres), 1 source — skeptic: maintenu. Les deux citations sont vérifiées (exact) et viennent de deux personnes distinctes, mais c'est le strict minimum. | **5/5** Déjà prêts à payer entre 500 et 10 000 euros, saisies bancaires, situation 'critique' — skeptic: maintenu. Les extraits confirment les saisies sur compte (URSSAF et impôts) et l'enjeu « redressement ou liquidation ». | **3/5** Proxy Autocomplete : ~11 suggestions pertinentes sur 'rattrapage comptabilité' (tarif, 2025, 2026) et 'tva en retard' (majoration, pénalité, comment payer) — skeptic: maintenu. Aucune suggestion ne vise les dettes URSSAF ou les saisies : l'angle « détresse » se cherche peu, il faut le capter par les requêtes rattrapage et TVA en retard. | **1/5** Le top 5 est tenu par des cabinets avec pages de service dédiées (Clementine x2, Dougs, Keobiz, Hayot), offres à partir de 890 € HT par exercice — skeptic: maintenu. Concurrence frontale sur le rattrapage pur. |

**Preuves**

- “Malheureusement, ma comptabilité n’a jamais été correctement suivie depuis la création, et je suis aujourd’hui dans une situation de rattrapage urgente, notamment vis-à-vis de l’URSSAF (aucun paiement depuis le début).” — [job-board](https://www.codeur.com/projects/460158-aide-comptable-eurl-urgent-relance-urssaf-mise-a-jour-tva) ✓
- “je fais face aujourd’hui à une situation critique nécessitant une remise à niveau complète et un arbitrage stratégique rapide : redressement ou liquidation.” — [job-board](https://www.codeur.com/projects/481696-audit-urgent-eurl-rattrapage-urssaf-decision-strategique) ✓

**Mots-clés Google:** `tarif rattrapage comptabilité`, `rattrapage comptabilité 2026`, `tva en retard`, `declaration tva en retard`, `majoration tva en retard`, `penalite tva en retard`, `comment payer tva en retard`

**Solutions existantes:** Clementine (comptabilité en retard), Dougs, Keobiz, Hayot Expertise, Consultants Malt (négociation d'échéanciers, ~550 €/jour), Codeur.com / Malt (comptables freelances)

**Idée de produit:** Un diagnostic d'urgence au forfait pour gérants d'EURL/SASU en retard : un questionnaire guidé recense dettes URSSAF/DGFiP, saisies et exercices non tenus, produit les demandes d'échéancier pré-remplies et une note d'aide à la décision redressement/liquidation, puis transmet le dossier à un expert-comptable ou un mandataire partenaire (commission d'apport) — là où Clementine, Dougs ou Keobiz ne vendent que le rattrapage par exercice. Acquisition : pages « tva en retard », « majoration tva en retard » et « comment payer tva en retard » avec un calculateur de pénalités gratuit qui mène au diagnostic.

**Notes du sceptique**

- C'est un service, pas un logiciel : peu scalable, et la tenue de comptabilité pour autrui est réservée aux experts-comptables (monopole de l'Ordre). Un produit doit rester côté diagnostic/orientation ou marketplace.
- Preuve très mince : 2 annonces sur une seule plateforme.
- Des clients en détresse financière, donc une capacité de paiement incertaine malgré les budgets annoncés.
- SERP verrouillée par des cabinets établis sur les requêtes de rattrapage.

## Écartées par le sceptique

- **Le site URSSAF auto-entrepreneur plante au moment de déclarer** — Douleur réelle et bien étayée (5 témoignages distincts, tous vérifiés 'exact'), mais c'est une panne d'infrastructure publique qu'un tiers ne peut pas corriger. Le contournement existe déjà : l'API Tierce Déclaration de l'URSSAF permet à des logiciels (Abby, partenaire officiel URSSAF, Propulse by CA, Superindep, Indy) de déclarer et payer automatiquement. La SERP est faite de pages de réclamation .gouv.fr : ce ne sont pas des concurrents, mais un domaine très difficile à dépasser pour une requête de panne épisodique. Note serpWeakness 2 jugée correcte.
- **Aucun humain pour répondre aux questions comptables** — Déjà résolu pour qui accepte de payer un peu plus : Superindep (dès 19 € HT/mois, conseiller par téléphone), Wity (29 €), Dougs (téléphone illimité), Clementine (≈75-89 € HT/mois). La plainte porte sur la qualité de service de vendeurs précis (Indy, Abby, Tiime), pas sur un manque du marché. Demande de recherche quasi nulle (2).
- **Statuts atypiques et facturation électronique non gérés** — Patchwork de plaintes portées chacune par une seule personne : entreprise de fait chez Tiime, lien URSSAF artiste-auteur chez Abby, bug d'activation PA, question générique « les micro fonctionnent ? », et un cas HN de freelances non immatriculés à l'étranger. Il n'y a pas de problème unique. La facturation électronique générique pour micro-entrepreneurs est saturée par des plateformes agréées gratuites (Indy, Abby, Tiime). À surveiller : artistes-auteurs face à l'obligation de réception au 1er septembre 2026, mais il n'y a aujourd'hui qu'une seule citation.
- **Fonctions de base manquantes ou absentes du mobile** — Ce sont des retours produit sur des applis précises (Indy, Abby), pas un manque du marché. Construire « une meilleure appli de facturation mobile » est banal, et le marché est saturé (Abby, Tiime, Henrri, Facture.net, Devis et Facture, applis BTP). SERP verrouillée (1).
- **Outils de compta trop lourds pour un freelance solo** — Idée banale (« un outil plus simple ») et preuves surtout anglo-saxonnes (HN, Xero/Freshbooks). En France, des outils simples et gratuits existent déjà : Henrri, Facture.net, Abby, Indy Essentiel à 0 €.
- **Gratuit trompeur, freemium agressif et honoraires élevés** — C'est exactement le cas « des gens veulent moins cher » : pas d'angle précis. Il existe des offres réellement gratuites (Henrri, Facture.net, Indy Essentiel, plan gratuit Abby). Une citation était hors sujet (« facture type ») et la citation « 240 HT/mois » vient d'un gérant d'EURL qui veut un expert-comptable humain moins cher, autre public. SERP saturée par les éditeurs.
- **Compta légère tout-en-un jusqu'à la déclaration fiscale** — Les preuves sont hors marché (Allemagne : Lexoffice/ELSTER, Inde, US : QuickBooks Self Employed). En France, Indy, Abby et Tiime couvrent déjà la chaîne facturation → dépenses → déclaration (2035, déclaration de CA), souvent en gratuit. SERP verrouillée (1).
- **Suivre les paiements et relancer les impayés** — Seulement 2 mentions : une annonce Codeur d'une PME (Excel + courriers Maileva, pas un freelance) et un avis Abby. Les relances automatiques existent déjà dans les outils courants (Abby, Henrri, Shine, Pennylane) et les outils de recouvrement (swim.legal, HighRadius). La demande vise surtout des modèles de lettres : c'est un jeu de contenu, pas un produit.
- **Outils de facturation pensés pour un seul pays** — Preuves hors marché (HN tiré d'un extrait de recherche, un ticket GitHub sur un outil US), intensité 2. Le multi-devises est déjà couvert (Harvest, SumUp, Moon Invoice…). La demande FR porte sur les règles de TVA pour clients étrangers (autoliquidation, mentions) : du contenu informationnel, pas un manque logiciel.

---
_Made with [gapscout](https://github.com/joaquimmj/gapscout) — find problems worth building._
