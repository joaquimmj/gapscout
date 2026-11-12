import type { Lang } from "./types.js";

/**
 * Multilingual vocabulary. Kept small and explicit on purpose: contributors can add a language
 * by copying one block. The LLM does the real reading; these only seed queries and pre-rank.
 */
interface LangPack {
  /** Phrases people use when something hurts. Matched case-insensitively as substrings. */
  pain: string[];
  /** Phrases that signal willingness to pay / switch. Weighted higher than plain pain. */
  wtp: string[];
  /** Templates to turn a niche into complaint-hunting queries. `{q}` is the niche. */
  complaintQueries: string[];
  /** Autocomplete modifiers that surface problem-shaped searches. Appended or prepended. */
  questionPrefixes: string[];
  problemSuffixes: string[];
  /** Words to ignore when extracting n-grams in the CLI's naive clustering. */
  stopwords: string[];
  /** Job-seeker searches in this language: not demand for a product. */
  jobNoise: RegExp;
  /** Google `gl` country default. */
  country: string;
}

const EN: LangPack = {
  pain: [
    "frustrat", "annoying", "annoyed", "i hate", "hate how", "pain in the", "nightmare", "tedious",
    "waste of time", "wasting hours", "so slow", "doesn't work", "does not work", "broken", "buggy",
    "struggl", "can't figure", "cannot figure", "confusing", "too expensive", "overpriced", "ridiculous",
    "drives me crazy", "sick of", "tired of", "fed up", "manually", "by hand", "spreadsheet hell",
    "workaround", "hacky", "no good way", "there's no way", "impossible to", "terrible", "awful", "worst",
  ],
  wtp: [
    "would pay", "i'd pay", "happy to pay", "shut up and take my money", "is there a tool",
    "is there an app", "any alternative", "alternative to", "looking for a tool", "looking for software",
    "recommend a tool", "switching from", "cancelled my subscription", "canceled my subscription",
  ],
  complaintQueries: [
    "{q}", "{q} frustrating", "{q} problem", "{q} alternative", "{q} is there a tool", "hate {q}",
  ],
  questionPrefixes: ["how to", "why is", "how do i", "best way to", "can't"],
  problemSuffixes: ["problem", "not working", "alternative", "too expensive", "tool", "software", "app", "template", "vs"],
  stopwords: "a an the and or but if of to in on for with at by from is are was were be been being it its this that these those i you he she we they my your our their me him her us them not no do does did have has had can could would should will just so very really about as into than then there here what which who when where why how all any some more most other such only own same too also get got like one also even much many".split(" "),
  jobNoise: /\b(jobs?|hiring|salary|salaries|careers?|vacanc(y|ies)|internships?)\b/i,
  country: "us",
};

const FR: LangPack = {
  pain: [
    "galère", "galere", "j'en ai marre", "marre de", "ras le bol", "ras-le-bol", "énervant", "enervant",
    "agaçant", "frustrant", "cauchemar", "perte de temps", "je perds", "trop cher", "hors de prix",
    "ne marche pas", "marche pas", "fonctionne pas", "bug", "planté", "lent", "impossible de",
    "compliqué", "prise de tête", "usine à gaz", "à la main", "manuellement", "fichier excel",
    "aucune solution", "pas de solution", "nul", "horrible", "le pire", "je déteste", "insupportable",
  ],
  wtp: [
    "je paierais", "prêt à payer", "pret a payer", "existe-t-il un outil", "existe t il", "un outil pour",
    "une appli pour", "une application pour", "alternative à", "alternative a", "vous utilisez quoi",
    "quel logiciel", "quel outil", "je cherche un outil", "je cherche un logiciel", "résilié", "j'ai résilié",
  ],
  complaintQueries: [
    "{q}", "{q} galère", "{q} problème", "{q} alternative", "{q} quel outil", "{q} marre",
  ],
  questionPrefixes: ["comment", "pourquoi", "comment faire", "quel logiciel", "quel outil"],
  problemSuffixes: ["problème", "ne marche pas", "alternative", "trop cher", "outil", "logiciel", "application", "modèle", "gratuit"],
  stopwords: "le la les un une des du de d l et ou mais si à a au aux en dans sur pour par avec sans ce cet cette ces c ça ca est sont été être je tu il elle on nous vous ils elles me te se mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs ne pas plus qui que quoi dont où ou y très tout tous toute toutes comme aussi fait faire avoir ai as avons avez ont j n s qu même bien peu".split(" "),
  jobNoise: /\b(offres?|emplois?|salaires?|recrutement|recrute|stage|alternance|cdi|télétravail|teletravail)\b/i,
  country: "fr",
};

const DE: LangPack = {
  pain: [
    "nervig", "nervt", "frustrierend", "frustriert", "ärgerlich", "albtraum", "zeitverschwendung",
    "zu teuer", "überteuert", "funktioniert nicht", "geht nicht", "kaputt", "fehlerhaft", "langsam",
    "kompliziert", "umständlich", "von hand", "manuell", "excel-tabelle", "keine lösung", "unmöglich",
    "schrecklich", "furchtbar", "hasse", "ich hasse", "keine ahnung wie",
  ],
  wtp: [
    "würde zahlen", "würde bezahlen", "gibt es ein tool", "gibt es eine app", "gibt es eine software",
    "alternative zu", "suche ein tool", "suche eine software", "welche software", "welches tool", "gekündigt",
  ],
  complaintQueries: ["{q}", "{q} problem", "{q} alternative", "{q} nervig", "{q} welches tool"],
  questionPrefixes: ["wie", "warum", "wie kann ich", "welche software", "welches tool"],
  problemSuffixes: ["problem", "funktioniert nicht", "alternative", "zu teuer", "tool", "software", "app", "vorlage", "kostenlos"],
  stopwords: "der die das ein eine einer eines einem einen und oder aber wenn von zu im in an auf für mit bei aus ist sind war waren sein es dies diese dieser ich du er sie wir ihr mein dein unser euer nicht kein keine ja nein wie was wer wann wo warum auch noch nur schon sehr mehr man sich mich mir dich dir uns".split(" "),
  jobNoise: /\b(stellen\w*|gehalt|jobbörse|ausbildung|praktikum)\b/i,
  country: "de",
};

const ES: LangPack = {
  pain: [
    "frustrante", "molesto", "me molesta", "pesadilla", "pérdida de tiempo", "perdida de tiempo",
    "demasiado caro", "carísimo", "no funciona", "no sirve", "roto", "lento", "complicado", "un lío",
    "a mano", "manualmente", "hoja de cálculo", "no hay solución", "imposible", "horrible", "lo peor",
    "odio", "harto de", "harta de", "estoy harto",
  ],
  wtp: [
    "pagaría", "pagaria", "hay alguna herramienta", "hay alguna app", "alguna alternativa",
    "alternativa a", "busco una herramienta", "busco un programa", "qué programa", "que programa",
    "qué herramienta", "cancelé",
  ],
  complaintQueries: ["{q}", "{q} problema", "{q} alternativa", "{q} qué herramienta", "{q} harto"],
  questionPrefixes: ["cómo", "por qué", "cómo hacer", "qué programa", "qué herramienta"],
  problemSuffixes: ["problema", "no funciona", "alternativa", "caro", "herramienta", "programa", "app", "plantilla", "gratis"],
  stopwords: "el la los las un una unos unas y o pero si de del a al en con sin por para es son fue ser estar está este esta estos estas ese esa eso yo tu él ella nosotros vosotros ellos mi mis tu tus su sus nuestro no sí que qué quien cómo como cuando donde muy más también ya solo me te se lo le les nos".split(" "),
  jobNoise: /\b(empleos?|sueldos?|trabajo|vacantes?|prácticas)\b/i,
  country: "es",
};

export const LANG_PACKS: Record<Lang, LangPack> = { en: EN, fr: FR, de: DE, es: ES };

export function isLang(x: string): x is Lang {
  return x in LANG_PACKS;
}

/**
 * A rough 0–1 pain signal for pre-ranking. Checks every language because people code-switch
 * (French freelancers complain in English on HN), but weights the target language first.
 */
export function painHint(text: string, lang: Lang): { score: number; terms: string[] } {
  const t = text.toLowerCase();
  const terms = new Set<string>();
  let score = 0;
  const packs = [LANG_PACKS[lang], ...Object.values(LANG_PACKS).filter((p) => p !== LANG_PACKS[lang])];
  for (const p of packs) {
    for (const w of p.pain) if (t.includes(w)) { terms.add(w); score += 1; }
    for (const w of p.wtp) if (t.includes(w)) { terms.add(w); score += 2; }
  }
  // Saturating curve: 1 hit ≈ 0.33, 3 hits ≈ 0.7, 6+ ≈ 0.9.
  return { score: Math.round((1 - Math.exp(-score / 2.5)) * 100) / 100, terms: [...terms].slice(0, 8) };
}

export function complaintQueries(niche: string, lang: Lang): string[] {
  return LANG_PACKS[lang].complaintQueries.map((t) => t.replace("{q}", niche));
}
