/**
 * Watches pages whose WORDING this site depends on.
 *
 * check-links.mjs proves a cited URL still resolves. That is a different and
 * weaker question. Twice now this project has been wrong because a German
 * government page kept its address and changed its text, and a reader acting on
 * the old wording loses money and months.
 *
 * Each entry in watch/pages.json says which words must still be present on a
 * page and which must still be absent. When one flips, this exits non-zero and
 * the workflow opens an issue naming the page and what changed.
 *
 * A fetch that fails, times out or is blocked is reported as a WARNING and does
 * not fail the run. That rule is inherited from the link checker on purpose: a
 * checker that cries wolf gets ignored, and then it protects nobody.
 *
 *   node scripts/check-watch.mjs [--report watch-report.md]
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const reportPath = (() => {
  const i = args.indexOf("--report");
  return i === -1 ? null : args[i + 1];
})();

const CONFIG = path.join(process.cwd(), "watch", "pages.json");
const TIMEOUT_MS = 30000;

// A real browser's User-Agent. diplo.de serves bot-looking clients differently,
// and a watcher that reads a different page from the one a student reads is
// worse than no watcher at all.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

/** Visible text, near enough. Scripts and styles out, tags to spaces. */
function toText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Case-insensitive, and tolerant of the whitespace a CMS re-flows. */
function has(text, needle) {
  const flat = (s) => s.toLowerCase().replace(/\s+/g, " ");
  return flat(text).includes(flat(needle));
}

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, "Accept-Language": "de,en;q=0.8" },
    });
    if (!res.ok) return { warn: `HTTP ${res.status}` };
    return { text: toText(await res.text()) };
  } catch (err) {
    return { warn: err.name === "AbortError" ? "timed out" : String(err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

const config = JSON.parse(fs.readFileSync(CONFIG, "utf8"));

const changed = [];
const warned = [];
const fine = [];

for (const p of config.pages) {
  const { text, warn } = await fetchText(p.url);
  if (warn) {
    warned.push({ ...p, warn });
    console.log(`WARN  ${p.id}: ${warn}`);
    continue;
  }

  const gone = (p.present || []).filter((w) => !has(text, w));
  const appeared = (p.absent || []).filter((w) => has(text, w));

  if (gone.length || appeared.length) {
    changed.push({ ...p, gone, appeared });
    console.log(`CHANGED  ${p.id}`);
    gone.forEach((w) => console.log(`    no longer says: ${w}`));
    appeared.forEach((w) => console.log(`    now says: ${w}`));
  } else {
    fine.push(p);
    console.log(`ok  ${p.id}`);
  }
}

if (reportPath) {
  const out = [];
  if (changed.length) {
    out.push("**A page this site depends on has changed its wording.**", "");
    for (const c of changed) {
      out.push(`### ${c.id}`, "", `<${c.url}>`, "", `_Why it is watched:_ ${c.why}`, "");
      for (const w of c.gone) out.push(`- no longer says **${w}**`);
      for (const w of c.appeared) out.push(`- **now says ${w}**`);
      out.push("", `Pages here that rely on it: ${(c.affects || []).map((a) => `\`${a}\``).join(", ") || "—"}`, "");
      out.push(
        "Read the page yourself before changing anything — then update the claim,",
        "its line in `SOURCES.md` with today's date, and the `present`/`absent`",
        "words in `watch/pages.json` so this stops firing.",
        ""
      );
    }
  }
  if (warned.length) {
    out.push("**Could not be checked this time** (not a failure):", "");
    for (const w of warned) out.push(`- ${w.id} — ${w.warn} — <${w.url}>`);
    out.push("");
  }
  if (fine.length) {
    out.push(`${fine.length} watched page(s) unchanged: ${fine.map((p) => p.id).join(", ")}.`, "");
  }
  fs.writeFileSync(reportPath, out.join("\n"));
}

console.log(
  `\n${changed.length} changed, ${warned.length} unchecked, ${fine.length} unchanged.`
);
process.exit(changed.length ? 1 : 0);
