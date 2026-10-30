/**
 * The fingerprint a translation records of the English text it was made from.
 *
 * Lives in its own module because two things need to agree on it exactly, and
 * they run in different places: src/_data/translations.js computes it during
 * the build so the page can tell the reader it has drifted, and
 * scripts/check-translations.mjs computes it in CI so the drift reaches a
 * maintainer. Two copies of this function would eventually disagree, and the
 * failure would look like every translation going stale at once.
 *
 * Runs of whitespace are collapsed first, so re-wrapping a paragraph is not a
 * change. Anything that alters a word is.
 *
 * Twelve hex characters is plenty: this is drift detection, not tamper
 * detection.
 */

import crypto from "node:crypto";

export function bodyHash(body) {
  const normal = body.replace(/\s+/g, " ").trim();
  return crypto.createHash("sha256").update(normal, "utf8").digest("hex").slice(0, 12);
}

/** Splits a page into its front matter and its body. Just enough YAML for the
 *  handful of scalar keys that decide which page is a translation of which — a
 *  real parser would be a dependency for four values. */
export function frontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };

  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^["']|["']$/g, "");
    if (v === "true") v = true;
    else if (v === "false") v = false;
    data[kv[1]] = v;
  }
  return { data, body: m[2] };
}

/** Eleventy derives a URL from the filename when a page sets no permalink —
 *  src/index.md becomes "/". Mirrored here so the home page is pairable without
 *  having to grow a permalink just to satisfy the checker. */
export function urlFor(file, data) {
  if (data.permalink) return data.permalink;
  const base = file.replace(/\.md$/, "");
  return base === "index" ? "/" : "/" + base + "/";
}
