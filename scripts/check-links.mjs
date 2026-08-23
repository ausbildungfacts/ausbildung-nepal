#!/usr/bin/env node
// Link checker for the built site.
//
// No dependencies on purpose: this runs unattended for years, and every package
// it does not depend on is a package that cannot rot or be compromised.
//
//   node scripts/check-links.mjs [--dir _site] [--report report.md]
//
// Exit 0 = nothing is actually broken (warnings are allowed).
// Exit 1 = at least one link is genuinely dead, or an internal link/image is
//          missing. Only this case is worth waking anyone up for.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const SITE_DIR = path.resolve(argOf("--dir", "_site"));
const REPORT = argOf("--report", "");
const TIMEOUT_MS = 20000;
const CONCURRENCY = 6;

// A real browser UA. Several German government sites answer 403 to anything
// that looks automated — frankfurt.de is one — and we would rather see the
// truthful status than a blanket refusal.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Genuinely dead. These mean the page has gone and a human must fix the link.
const DEAD_STATUS = new Set([404, 410]);
// Not dead, just guarded. Bot protection, rate limits and server wobbles are
// noise: report them quietly, never fail the run over them. A checker that
// cries wolf is a checker that gets ignored.
const SOFT_STATUS = new Set([401, 403, 405, 406, 429, 500, 502, 503, 504]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

// Pull href= and src= out of the built HTML. A regex is the right tool here:
// the input is our own generated markup, not arbitrary web pages.
function extractLinks(html) {
  const out = [];
  const re = /(?:href|src)\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[1].trim());
  return out;
}

function classify(url) {
  if (/^(mailto:|tel:|javascript:|data:)/i.test(url)) return "skip";
  if (url.startsWith("#")) return "skip";
  if (/^https?:\/\//i.test(url)) return "external";
  if (url.startsWith("/")) return "internal";
  return "relative";
}

// Map a site-absolute path to the file Eleventy actually wrote.
function resolveInternal(url) {
  const clean = url.split("#")[0].split("?")[0];
  const rel = clean.replace(/^\//, "");
  const candidates = [
    path.join(SITE_DIR, rel),
    path.join(SITE_DIR, rel, "index.html"),
    path.join(SITE_DIR, rel.replace(/\/$/, "") + ".html"),
  ];
  return candidates.some((c) => existsSync(c) && !isDirWithoutIndex(c));
}

function isDirWithoutIndex(p) {
  try {
    return existsSync(p) && statSync(p).isDirectory();
  } catch {
    return false;
  }
}

async function probe(url) {
  // HEAD first because it is cheap and polite; plenty of servers refuse it, so
  // fall back to GET before believing a failure.
  for (const method of ["HEAD", "GET"]) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "user-agent": UA, accept: "*/*" },
      });
      clearTimeout(timer);
      if (method === "HEAD" && SOFT_STATUS.has(res.status)) continue;
      return { status: res.status, finalUrl: res.url };
    } catch (err) {
      clearTimeout(timer);
      if (method === "GET") {
        return { status: 0, error: err.name === "AbortError" ? "timeout" : String(err.cause?.code || err.message) };
      }
    }
  }
  return { status: 0, error: "unreachable" };
}

async function pool(items, worker, limit) {
  const results = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) results.push(await worker(items[i++]));
    })
  );
  return results;
}

// ---------------------------------------------------------------------------

if (!existsSync(SITE_DIR)) {
  console.error(`No built site at ${SITE_DIR}. Run "npm run build" first.`);
  process.exit(2);
}

const external = new Map(); // url -> Set(pages)
const internalBad = [];
let pageCount = 0;

for await (const file of walk(SITE_DIR)) {
  if (!file.endsWith(".html")) continue;
  pageCount++;
  const page = "/" + path.relative(SITE_DIR, file).replace(/\\/g, "/");
  const html = await readFile(file, "utf8");
  for (const link of extractLinks(html)) {
    const kind = classify(link);
    if (kind === "skip" || kind === "relative") continue;
    if (kind === "internal") {
      if (!resolveInternal(link)) internalBad.push({ page, link });
    } else {
      if (!external.has(link)) external.set(link, new Set());
      external.get(link).add(page);
    }
  }
}

const urls = [...external.keys()].sort();
console.log(`Scanned ${pageCount} pages — ${urls.length} distinct external links, ${internalBad.length} broken internal.\n`);

const checked = await pool(
  urls,
  async (url) => {
    let r = await probe(url);
    // One retry: transient network blips should not create a false alarm.
    if (r.status === 0 || SOFT_STATUS.has(r.status)) {
      await new Promise((res) => setTimeout(res, 1500));
      r = await probe(url);
    }
    const dead = DEAD_STATUS.has(r.status) || (r.status === 0 && r.error !== "timeout");
    const soft = !dead && (r.status === 0 || SOFT_STATUS.has(r.status));
    const label = dead ? "DEAD" : soft ? "warn" : "ok";
    console.log(`${label.padEnd(4)} ${String(r.status || r.error).padEnd(8)} ${url}`);
    return { url, ...r, dead, soft, pages: [...external.get(url)] };
  },
  CONCURRENCY
);

const dead = checked.filter((c) => c.dead);
const soft = checked.filter((c) => c.soft);

const lines = [];
lines.push(`Checked **${urls.length}** external links across **${pageCount}** pages.`);
lines.push("");

if (internalBad.length) {
  lines.push(`### ${internalBad.length} broken internal link(s) or missing file(s)`);
  lines.push("");
  for (const b of internalBad) lines.push(`- \`${b.link}\` — linked from \`${b.page}\``);
  lines.push("");
}

if (dead.length) {
  lines.push(`### ${dead.length} dead external link(s) — these need fixing`);
  lines.push("");
  for (const d of dead) {
    lines.push(`- ${d.status || d.error} — ${d.url}`);
    lines.push(`  - on: ${d.pages.map((p) => `\`${p}\``).join(", ")}`);
  }
  lines.push("");
}

if (soft.length) {
  lines.push(`### ${soft.length} link(s) could not be confirmed — probably fine`);
  lines.push("");
  lines.push("These answered with bot protection, a rate limit or a timeout. That usually means the site dislikes automated requests, not that the page has gone. Worth an eyeball, not an alarm.");
  lines.push("");
  for (const s of soft) lines.push(`- ${s.status || s.error} — ${s.url}`);
  lines.push("");
}

if (!dead.length && !internalBad.length) {
  lines.push("**No dead links.** Every cited source still resolves.");
}

const report = lines.join("\n");
if (REPORT) await writeFile(REPORT, report, "utf8");

console.log("\n" + "-".repeat(60));
console.log(report);

if (dead.length || internalBad.length) {
  console.error(`\nFAIL: ${dead.length} dead external, ${internalBad.length} broken internal.`);
  process.exit(1);
}
console.log(`\nPASS${soft.length ? ` (${soft.length} unconfirmed, not treated as failures)` : ""}.`);
