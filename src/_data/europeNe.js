/**
 * The Europe page's data, with Nepali text laid over the English.
 *
 * Why this file rather than a translated page
 * ------------------------------------------
 * /europe/ is not really markdown. src/europe.md is a thin Nunjucks shell and
 * almost every sentence on the page lives in src/_data/europe.json — roughly
 * 14,700 words of it, more than any other page on this site. Translating the
 * shell would have produced a Nepali-titled page full of English.
 *
 * So the Nepali page swaps the DATA instead of rewriting the template. It sets
 * "eu" to this object rather than to "europe", and every one of the couple of
 * hundred field references in the template then picks up Nepali without being
 * touched. src/ne/europe.md is otherwise the same template, which is the point:
 * two copies of 200 field paths would drift apart within a month.
 *
 * Anything not yet translated falls back to the English, field by field. That
 * is deliberate. A reader meets a Nepali page with some English notes in it,
 * rather than no Nepali page at all, and the per-page notice at the top of
 * every Nepali page already tells them the English is authoritative.
 * scripts/check-translations.mjs counts and reports how much is still English.
 *
 * The Nepali lives OUTSIDE src/_data/ on purpose. check-figures.mjs rewrites
 * europe.json from Eurostat every month and opens a pull request; keeping
 * hand-written translation out of that file means the monthly diff can never
 * collide with it.
 *
 * ONE DEFAULT EXPORT. Eleventy hands a template the module namespace rather
 * than the called result if this file exports anything else, which looks
 * exactly like the data being empty.
 */

import fs from "node:fs";
import path from "node:path";

const EN = path.join(process.cwd(), "src", "_data", "europe.json");
const NE = path.join(process.cwd(), "src", "_translations", "europe.ne.json");

/**
 * Lay "over" on top of "base", field by field.
 *
 * - a string, number or boolean in the override replaces the English
 * - objects merge, so an override may name one field and leave its siblings
 * - arrays merge BY INDEX, so an override array can translate the third row of
 *   a table and say nothing about the other four. The override is written
 *   against this exact file, so the order is known; null or a missing slot
 *   means "keep the English".
 *
 * An override key that does not exist in the English is kept rather than
 * dropped, so a mistyped path shows up on the page as something obviously
 * wrong instead of silently doing nothing.
 */
function overlay(base, over) {
  if (over === undefined || over === null) return base;

  if (Array.isArray(base) && Array.isArray(over)) {
    return base.map((item, i) => overlay(item, over[i]));
  }

  const plainObject = (v) =>
    v !== null && typeof v === "object" && !Array.isArray(v);

  if (plainObject(base) && plainObject(over)) {
    const out = { ...base };
    for (const key of Object.keys(over)) {
      out[key] = key in base ? overlay(base[key], over[key]) : over[key];
    }
    return out;
  }

  return over;
}

export default function () {
  const english = JSON.parse(fs.readFileSync(EN, "utf8"));
  if (!fs.existsSync(NE)) return english;
  const nepali = JSON.parse(fs.readFileSync(NE, "utf8"));
  return overlay(english, nepali);
}
