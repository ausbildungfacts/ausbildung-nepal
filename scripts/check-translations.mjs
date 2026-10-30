/**
 * Watches the NEPALI MIRROR against the English it was made from.
 *
 * The fourth of the checks in this repo, and the only one that looks at two
 * versions of the same sentence:
 *
 *   check-links        — does the cited URL still resolve?
 *   check-watch        — does the source page still SAY what we quoted?
 *   check-figures      — are the NUMBERS still the current ones?
 *   check-translations — does the Nepali still match the English?
 *
 * A translated mirror fails quietly. Nothing breaks when the English page is
 * corrected and the Nepali one is not: no link dies, no build error, no number
 * looks wrong on its own. The page simply goes on telling a reader something
 * this site no longer believes — in the language of the reader least able to
 * check it against the German sources. That is the whole risk of publishing in
 * a language the people maintaining the site cannot read, and this file is the
 * answer to it.
 *
 *   node scripts/check-translations.mjs
 *   node scripts/check-translations.mjs --report out.md
 *
 * Exits 1 when something needs a human, 0 when the mirror is sound. The weekly
 * workflow uses that to decide whether to open an issue.
 *
 * What it will NOT tell you is whether the Nepali is any good. No script can.
 * A page whose translationState is "machine" has not been read by a Nepali
 * speaker, and this checker passing does not change that — it only proves the
 * figures, the German terms and the structure survived.
 */

import fs from "node:fs";
import path from "node:path";
import { bodyHash, frontMatter, urlFor } from "./lib/body-hash.mjs";

const args = process.argv.slice(2);
const reportPath = (() => {
  const i = args.indexOf("--report");
  return i === -1 ? null : args[i + 1];
})();

const SRC = path.join(process.cwd(), "src");
const NE = path.join(SRC, "ne");

/**
 * Pages deliberately NOT mirrored, and why.
 *
 * The imprint and the privacy notice are German legal instruments — para 5 DDG
 * and para 18 MStV say what they must contain and in what form. A translated
 * legal notice is a second version of a document whose exact wording is the
 * point, and it would carry the name and home address behind this site into a
 * second set of URLs for no benefit: both pages are noindex, and a reader who
 * needs them is reading them to check a legal detail, not to be persuaded.
 *
 * The Nepali pages link to the English ones, marked with lang="en".
 */
const NOT_MIRRORED = {
  "/impressum/": "German legal notice, exact wording is the point",
  "/datenschutz/": "German legal notice, exact wording is the point",
};

/**
 * Terms that must survive translation unchanged.
 *
 * Every one of these is a word the reader will have to RECOGNISE somewhere
 * else: on an embassy list, in a contract, on a form, in an email from an
 * employer. A reader who has only ever seen a Nepali paraphrase cannot search
 * for Vorabzustimmung, cannot ask an employer for one by name, and cannot tell
 * whether the document they have been handed is the right one.
 *
 * The statute numbers matter for the same reason and more: 296a SGB III is the
 * entire basis for saying nobody may charge you, and a reader who wants to put
 * that to an institute needs the string, not a paraphrase of it.
 *
 * The test is presence, not count: a term in the English must appear at least
 * once in the Nepali. Requiring equal counts would fail on ordinary differences
 * of style — Nepali often needs a noun repeated where English uses a pronoun —
 * and a checker that cries wolf is a checker people stop reading.
 */
const PROTECTED = [
  // The thing itself, and the institutions
  "Ausbildung", "Berufsschule", "Bundesagentur für Arbeit", "ZAV",
  "Vorabzustimmung", "Anerkennung", "IHK", "HWK",
  // Statutes
  "SGB III", "296a", "81a", "16a", "AufenthG", "DDG", "MStV",
  // Language certificates and the providers on the embassy list
  "Goethe", "ÖSD", "telc", "ECL", "VHS", "A1", "A2", "B1", "B2",
  // Documents a reader has to produce or ask for by name
  "Lebenslauf", "Anschreiben",
  // Routes and programmes
  "Au Pair", "FSJ", "Bundesfreiwilligendienst", "Mechatroniker",
];

const failures = [];
const warnings = [];
const notes = [];

function read(dir, file) {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const { data, body } = frontMatter(raw);
  return { file, data, body, hash: bodyHash(body) };
}

/** Prose only. Strips HTML tags so image dimensions and URLs in attributes do
 *  not read as figures a translator dropped. */
const prose = (body) => body.replace(/<[^>]*>/g, " ");

/** Every figure in a page as the reader meets it: 1,200 and 187 and 411.
 *  Thousands separators are kept, because "1,200" and "1200" are different
 *  strings on the page and the point is that the Nepali shows the same one.
 *
 *  A trailing comma is dropped first. Prose puts commas after figures all the
 *  time — "B1, certified and not older than six months" yields the token "1,"
 *  — and a token that can never match anything is a false failure every week
 *  until somebody stops reading the report. */
function figures(body) {
  const raw = prose(body).match(/\d[\d,]*/g) || [];
  return [...new Set(raw.map((n) => n.replace(/,+$/, "")))];
}

/** Internal markdown links, so a Nepali page can be checked for links that
 *  would drop the reader back into English halfway down the page. */
function internalLinks(body) {
  return [...new Set([...body.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1]))];
}

// ---------------------------------------------------------------------------

const english = new Map();
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith(".md"))) {
  const page = read(SRC, f);
  english.set(urlFor(f, page.data), page);
}

const nepali = new Map();
if (fs.existsSync(NE)) {
  for (const f of fs.readdirSync(NE).filter((x) => x.endsWith(".md"))) {
    const page = read(NE, f);
    nepali.set(page.data.permalink || "/ne/" + f.replace(/\.md$/, "") + "/", page);
  }
}

// Which English URLs have a Nepali counterpart, so link checking can tell the
// difference between "should point at /ne/" and "there is no /ne/ version".
const translatedEn = new Set(
  [...nepali.values()].map((p) => p.data.translationOf).filter(Boolean)
);

for (const [neUrl, ne] of [...nepali.entries()].sort()) {
  const enUrl = ne.data.translationOf;
  const label = neUrl + " (" + ne.file + ")";

  if (!enUrl) {
    failures.push(label + " — no translationOf in its front matter, so nothing can tell which English page it mirrors.");
    continue;
  }

  const source = english.get(enUrl);
  if (!source) {
    failures.push(label + " — translationOf names " + enUrl + ", an English page that does not exist. Renamed or deleted?");
    continue;
  }

  // 1. Drift.
  if (!ne.data.sourceHash) {
    failures.push(label + " — no sourceHash, so drift cannot be detected. Add sourceHash: " + source.hash);
  } else if (ne.data.sourceHash !== source.hash) {
    failures.push(
      label + " — the English page has changed since this was translated.\n" +
      "    recorded: " + ne.data.sourceHash + "   current: " + source.hash + "\n" +
      "    Re-read " + enUrl + ", update the Nepali, then set sourceHash: " + source.hash
    );
  }

  // 2. Terms the reader has to recognise elsewhere.
  const missingTerms = PROTECTED.filter(
    (t) => source.body.includes(t) && !ne.body.includes(t)
  );
  if (missingTerms.length) {
    failures.push(
      label + " — in the English but not the Nepali: " + missingTerms.join(", ") +
      "\n    A reader cannot search for, or ask an employer about, a term they have never seen."
    );
  }

  // 3. Figures.
  const neProse = prose(ne.body);
  const missingFigures = figures(source.body).filter((n) => !neProse.includes(n));
  if (missingFigures.length) {
    failures.push(
      label + " — figures in the English but not the Nepali: " + missingFigures.join(", ") +
      "\n    Either the translation dropped one, or it was written in Devanagari digits. This site uses Arabic numerals so a reader can match a figure against the document in their hand."
    );
  }

  // 4. Links that would drop the reader back into English.
  const links = internalLinks(ne.body);
  const strays = links.filter(
    (href) => translatedEn.has(href) && !href.startsWith("/ne/")
  );
  if (strays.length) {
    failures.push(
      label + " — links to the English version of pages that exist in Nepali: " + strays.join(", ") +
      "\n    Point these at /ne/ so a reader is not dropped into English halfway down the page."
    );
  }

  // 5. Links into the mirror that land nowhere.
  //
  // Translating page by page means writing /ne/ links to pages that do not
  // exist yet. Left alone that is a 404 in the middle of the one page a reader
  // was told to go and read, so it fails here until the target exists. While
  // the mirror is being built this doubles as the list of what is left.
  const dangling = links.filter((href) => href.startsWith("/ne/") && !nepali.has(href));
  if (dangling.length) {
    failures.push(
      label + " — links to Nepali pages that do not exist: " + dangling.join(", ") +
      "\n    Either translate the target, or point the link at the English page for now."
    );
  }

  // 6. State, for the record rather than as a pass or fail.
  const state = ne.data.translationState || "machine";
  if (state === "machine") {
    notes.push(neUrl + " — machine translation, not yet read by a Nepali speaker.");
  } else if (state === "checked") {
    notes.push(
      neUrl + " — checked" +
      (ne.data.checkedDate ? " " + ne.data.checkedDate : "") +
      (ne.data.checkedBy ? " by " + ne.data.checkedBy : "") + "."
    );
  } else {
    warnings.push(neUrl + " — unrecognised translationState: " + state + ". Expected machine or checked.");
  }
}

// 7. Coverage.
for (const enUrl of [...english.keys()].sort()) {
  if (translatedEn.has(enUrl)) continue;
  if (enUrl in NOT_MIRRORED) {
    notes.push(enUrl + " — deliberately English only (" + NOT_MIRRORED[enUrl] + ").");
  } else {
    warnings.push(enUrl + " — no Nepali version yet.");
  }
}

// ---------------------------------------------------------------------------
// 8. The Europe page is a special case, and silence about it would be
//    misleading.
//
//    /europe/ is a thin template over src/_data/europe.json, so counting it as
//    "translated" because src/ne/europe.md exists would hide the fact that most
//    of what a reader sees there still comes out of the English data file. The
//    Nepali page lays src/_translations/europe.ne.json over it field by field
//    and falls back to English for anything missing, so this measures how much
//    of that page is actually in Nepali and says so in the report.

const EUROPE_EN = path.join(SRC, "_data", "europe.json");
const EUROPE_NE = path.join(process.cwd(), "src", "_translations", "europe.ne.json");

if (fs.existsSync(EUROPE_EN)) {
  // Fields that are never translated and must not count against coverage: a
  // URL, a date, an evidence grade and an internal slug are the same in both
  // languages. Counting them made 100% unreachable and the figure meaningless.
  //
  // "id" and "group" are keys the template matches on, not text anyone reads —
  // translating "germany" would quietly break the grouping on the page.
  const NOT_PROSE = new Set(["url", "checked", "status", "as_of", "group", "id"]);

  const countWords = (v, key) => {
    if (NOT_PROSE.has(key)) return 0;
    if (typeof v === "string") return v.trim() ? v.trim().split(/\s+/).length : 0;
    if (Array.isArray(v)) return v.reduce((a, x) => a + countWords(x, key), 0);
    if (v && typeof v === "object") {
      return Object.entries(v).reduce((a, [k, x]) => a + countWords(x, k), 0);
    }
    return 0;
  };

  // Words that the override actually replaces, counted against the English so
  // the figure is "how much of the page is Nepali", not "how much Nepali exists".
  const covered = (en, ne, key) => {
    if (NOT_PROSE.has(key)) return 0;
    if (ne === undefined || ne === null) return 0;
    if (typeof en === "string") return countWords(en, key);
    if (Array.isArray(en) && Array.isArray(ne)) {
      return en.reduce((a, item, i) => a + covered(item, ne[i], key), 0);
    }
    if (en && typeof en === "object" && ne && typeof ne === "object") {
      return Object.keys(en).reduce((a, k) => a + covered(en[k], ne[k], k), 0);
    }
    return 0;
  };

  const enData = JSON.parse(fs.readFileSync(EUROPE_EN, "utf8"));
  const neData = fs.existsSync(EUROPE_NE)
    ? JSON.parse(fs.readFileSync(EUROPE_NE, "utf8"))
    : {};

  const sections = ["europe_wide", "countries", "au_pair", "other_routes", "scam_patterns"];
  const lines = [];
  let totalWords = 0;
  let totalDone = 0;

  for (const key of sections) {
    if (!(key in enData)) continue;
    const words = countWords(enData[key], key);
    const done = covered(enData[key], neData[key], key);
    totalWords += words;
    totalDone += done;
    const pct = words ? Math.round((done / words) * 100) : 100;
    lines.push("    " + key.padEnd(14) + " " + String(pct).padStart(3) + "%  (" + done + " of " + words + " words)");
  }

  const pct = totalWords ? Math.round((totalDone / totalWords) * 100) : 100;
  const tail =
    totalDone >= totalWords
      ? " Nothing on that page falls back to English any more."
      : " The rest falls back to English on the page.";
  const summary =
    "/ne/europe/ — " + pct + "% of the Europe data is in Nepali (" +
    totalDone + " of " + totalWords + " words)." + tail + "\n" +
    lines.join("\n");

  if (pct === 100) notes.push(summary);
  else warnings.push(summary);

  // Figures inside the translated data get the same guarantee the pages get.
  //
  // The numbers the page prints from europe.json fields are safe: they are not
  // translated. But the PROSE here quotes figures inline — "€724 a month",
  // "41%", "40% of training contracts" — and those were retyped by hand into
  // Nepali. A dropped digit in that prose is exactly the damage this site
  // exists to avoid, and nothing else would catch it.
  const figuresIn = (s) =>
    [...new Set((s.match(/\d[\d,.]*/g) || []).map((n) => n.replace(/[.,]+$/, "")))];

  const figureProblems = [];
  const compare = (en, ne, p) => {
    if (typeof en === "string" && typeof ne === "string") {
      const missing = figuresIn(en).filter((n) => !ne.includes(n));
      if (missing.length) figureProblems.push(p + " — " + missing.join(", "));
      return;
    }
    if (Array.isArray(en) && Array.isArray(ne)) {
      en.forEach((x, i) => compare(x, ne[i], p + "[" + i + "]"));
      return;
    }
    if (en && typeof en === "object" && ne && typeof ne === "object") {
      for (const k of Object.keys(en)) {
        if (NOT_PROSE.has(k)) continue;
        if (k in ne) compare(en[k], ne[k], p ? p + "." + k : k);
      }
    }
  };

  for (const key of sections) {
    if (key in enData && key in neData) compare(enData[key], neData[key], key);
  }

  if (figureProblems.length) {
    failures.push(
      "src/_translations/europe.ne.json — figures in the English that did not survive into the Nepali:\n    " +
        figureProblems.join("\n    ") +
        "\n    Each is a path into europe.json. Check the Nepali string at that path against the English."
    );
  }
}

// ---------------------------------------------------------------------------

const mirrorable = english.size - Object.keys(NOT_MIRRORED).length;
const checkedCount = [...nepali.values()].filter(
  (p) => p.data.translationState === "checked"
).length;

const lines = [];
lines.push("# The Nepali mirror");
lines.push("");
lines.push(
  nepali.size + " of " + mirrorable + " mirrorable pages translated. " +
  checkedCount + " read by a Nepali speaker."
);
lines.push("");

if (failures.length) {
  lines.push("## Needs fixing");
  lines.push("");
  for (const f of failures) lines.push("- " + f);
  lines.push("");
}
if (warnings.length) {
  lines.push("## Worth knowing");
  lines.push("");
  for (const w of warnings) lines.push("- " + w);
  lines.push("");
}
if (notes.length) {
  lines.push("## State of each page");
  lines.push("");
  for (const n of notes) lines.push("- " + n);
  lines.push("");
}
if (!failures.length) {
  lines.push("Every translated page matches the English it records: no drift, no dropped figures, no missing German terms.");
  lines.push("");
  lines.push("**This does not mean the Nepali is good.** Only a Nepali speaker can say that, and the pages listed above as machine translations have not had one.");
}

const report = lines.join("\n");
console.log(report);
if (reportPath) fs.writeFileSync(reportPath, report + "\n", "utf8");

process.exit(failures.length ? 1 : 0);
