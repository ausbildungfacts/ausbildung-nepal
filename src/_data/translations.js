/**
 * Pairs each English page with its Nepali translation, and works out at BUILD
 * TIME whether that translation has fallen behind.
 *
 * Why this exists
 * ---------------
 * A translated mirror has one failure mode that matters: the English page gets
 * corrected, the Nepali page does not, and a reader acts on the old figure. It
 * fails silently — no link breaks, no number looks wrong, nothing turns red.
 *
 * So a Nepali page does not get to claim it is current. It records a hash of
 * the English text it was made from. This file recomputes that hash from the
 * English page as it stands now, and when the two differ the page tells the
 * reader so, in Nepali, above the content. Nobody has to remember to flip a
 * flag and there is no state to maintain: the notice appears the moment the
 * English is edited and goes away the moment the translation catches up.
 *
 * scripts/check-translations.mjs reads the same values and fails the weekly
 * run, which is how drift reaches a maintainer rather than only a reader.
 *
 * ONE DEFAULT EXPORT, DELIBERATELY. Eleventy hands a template the module
 * namespace rather than the called result if this file exports anything
 * besides a default — which looks exactly like the register being empty, and
 * the page then silently claims to be a checked translation. The shared helpers
 * live in scripts/lib/body-hash.mjs for that reason.
 */

import fs from "node:fs";
import path from "node:path";
import { bodyHash, frontMatter, urlFor } from "../../scripts/lib/body-hash.mjs";

const SRC = path.join(process.cwd(), "src");
const NE = path.join(SRC, "ne");

function read(dir, file) {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const { data, body } = frontMatter(raw);
  return { file, data, body, hash: bodyHash(body) };
}

export default function () {
  const english = new Map();
  for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith(".md"))) {
    const page = read(SRC, f);
    english.set(urlFor(f, page.data), page);
  }

  const byEn = {};
  const byNe = {};

  if (fs.existsSync(NE)) {
    for (const f of fs.readdirSync(NE).filter((x) => x.endsWith(".md"))) {
      const ne = read(NE, f);
      const enUrl = ne.data.translationOf;
      const source = enUrl ? english.get(enUrl) : undefined;

      // A translation that names no source, or names one that has since been
      // renamed or deleted, counts as stale rather than current. Being wrongly
      // reassuring is the one outcome this whole mechanism exists to prevent,
      // so an unanswerable question resolves to "do not trust it".
      const currentHash = source ? source.hash : null;
      const stale = !source || ne.data.sourceHash !== currentHash;

      const entry = {
        enUrl: enUrl || null,
        neUrl: ne.data.permalink || null,
        state: ne.data.translationState || "machine",
        checkedBy: ne.data.checkedBy || null,
        checkedDate: ne.data.checkedDate || null,
        recordedHash: ne.data.sourceHash || null,
        currentHash,
        stale,
        orphan: !source,
      };

      if (entry.neUrl) byNe[entry.neUrl] = entry;
      if (enUrl) byEn[enUrl] = entry;
    }
  }

  // English pages with no Nepali counterpart at all. The language switch has to
  // know not to offer a link that would 404.
  const untranslated = [...english.keys()].filter((url) => !byEn[url]);

  return { byEn, byNe, untranslated };
}
