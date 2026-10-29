/**
 * Watches the NUMBERS the Europe page is built on.
 *
 * check-links.mjs proves a cited URL still resolves. check-watch.mjs proves a
 * page still SAYS what we told readers it says. This asks the third question:
 * are the figures still the current ones?
 *
 * Minimum wages move twice a year. Tax and social contribution rates move every
 * year. Neither announces itself, and neither breaks a link — so without this,
 * /europe/ would quietly drift out of date while every other check stayed green.
 *
 * Eurostat publishes all of it through an API: dated, versioned, machine
 * readable. That is the only reason this page can maintain itself at all, and
 * it is why the figures live in src/_data/europe.json rather than in prose.
 *
 *   node scripts/check-figures.mjs                 # report only
 *   node scripts/check-figures.mjs --write         # also update europe.json
 *   node scripts/check-figures.mjs --report out.md # write a summary
 *
 * Exits 1 when something changed, 0 when nothing did. The workflow uses that to
 * decide whether to open a pull request.
 *
 * IT DOES NOT PUBLISH. It proposes. A human reads the summary and presses
 * merge, because a number that changed may also make a sentence wrong, and no
 * script can see that.
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const reportPath = (() => {
  const i = args.indexOf("--report");
  return i === -1 ? null : args[i + 1];
})();

const DATA = path.join(process.cwd(), "src", "_data", "europe.json");
const API = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";
const TIMEOUT_MS = 60000;

/** Eurostat geo codes for the countries the money table covers. */
const GEO = {
  germany: "DE",
  cyprus: "CY",
  malta: "MT",
  portugal: "PT",
  greece: "EL",
  croatia: "HR",
  poland: "PL",
  romania: "RO",
  bulgaria: "BG",
};

/** Employee social insurance share used for the Ausbildung net figures. Not
 *  from Eurostat — see the arithmetic note on the page. Kept here so the two
 *  stay in step. */
const AUSBILDUNG_SOC = 0.21;

const round5 = (n) => Math.round(n / 5) * 5;

async function getJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (body.error) throw new Error(JSON.stringify(body.error));
    return body;
  } finally {
    clearTimeout(timer);
  }
}

/** Eurostat returns a flat array plus dimension indexes. This turns a set of
 *  named coordinates into the right offset into that array.
 *
 *  Any dimension not named defaults to its first value. That is how `freq` is
 *  handled: both datasets carry exactly one frequency, but they do not use the
 *  same code for it — the wage dataset is "S" (semi-annual) and the earnings
 *  dataset is "A" (annual). Naming it got this wrong once already. */
function reader(ds) {
  const { id: ids, size, dimension, value } = ds;
  return (coords) => {
    let pos = 0;
    for (let k = 0; k < ids.length; k++) {
      const dim = ids[k];
      const idx =
        coords[dim] === undefined
          ? 0
          : dimension[dim].category.index[coords[dim]];
      if (idx === undefined) return undefined;
      pos = pos * size[k] + idx;
    }
    return value[pos];
  };
}

/** The most recent period in a dimension that actually carries a value. */
function latestPeriods(ds, dim = "time") {
  return Object.keys(ds.dimension[dim].category.index).sort();
}

async function fetchWages() {
  const ds = await getJson(`${API}/earn_mw_cur?format=JSON&lang=EN`);
  const read = reader(ds);
  const periods = latestPeriods(ds);
  const out = {};
  let used = null;

  // Walk back from the newest period until one has data for everybody. A period
  // appears in the dataset before every country has reported into it.
  for (let i = periods.length - 1; i >= 0; i--) {
    const t = periods[i];
    const row = {};
    let complete = true;
    for (const [id, geo] of Object.entries(GEO)) {
      const eur = read({ currency: "EUR", geo, time: t });
      const pps = read({ currency: "PPS", geo, time: t });
      if (eur === undefined || pps === undefined) {
        complete = false;
        break;
      }
      row[id] = { eur: Math.round(eur), pps: Math.round(pps) };
    }
    if (complete) {
      Object.assign(out, row);
      used = t;
      break;
    }
  }
  if (!used) throw new Error("no complete minimum-wage period found");
  return { period: used, wages: out, updated: ds.updated };
}

async function fetchDeductions() {
  const ds = await getJson(`${API}/earn_nt_net?format=JSON&lang=EN`);
  const read = reader(ds);
  const periods = latestPeriods(ds);
  const out = {};
  let used = null;

  for (let i = periods.length - 1; i >= 0; i--) {
    const t = periods[i];
    const row = {};
    let complete = true;
    for (const [id, geo] of Object.entries(GEO)) {
      const at = (estruct) =>
        read({
          currency: "EUR",
          estruct,
          ecase: "P1_NCH_AW50",
          geo,
          time: t,
        });
      const grs = at("GRS");
      const tax = at("TAX") ?? 0;
      const soc = at("SOC") ?? 0;
      if (grs === undefined || !grs) {
        complete = false;
        break;
      }
      // Deliberately computed from the published components rather than from
      // Eurostat's NET figure: for several countries NET does not equal
      // gross - tax - social, and we could never explain why. See SOURCES.md.
      row[id] = Number((((tax + soc) / grs) * 100).toFixed(1));
    }
    if (complete) {
      Object.assign(out, row);
      used = t;
      break;
    }
  }
  if (!used) throw new Error("no complete net-earnings period found");
  return { period: used, deductions: out, updated: ds.updated };
}

/** Has BIBB published a newer year of training allowances? The URL pattern has
 *  been stable for years, so we just ask whether next year's file exists. */
async function checkBibb(currentYear) {
  const next = currentYear + 1;
  const url =
    `https://www.bibb.de/dokumente/xls/${next}_Dav-Gesamt` +
    encodeURIComponent("übersicht") +
    `_Ausbildungsverg${encodeURIComponent("ütungen")}_Bundesgebiet.xlsx`;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok ? { newYear: next, url } : null;
  } catch {
    return null; // a failed probe is never an alarm
  }
}

// ---------------------------------------------------------------------------

const data = JSON.parse(fs.readFileSync(DATA, "utf8"));
const changes = [];
const warnings = [];

let wages, deds, bibb;
try {
  wages = await fetchWages();
} catch (e) {
  warnings.push(`minimum wages could not be checked — ${e.message}`);
}
try {
  deds = await fetchDeductions();
} catch (e) {
  warnings.push(`tax and social contributions could not be checked — ${e.message}`);
}

const oldValues = new Set();

for (const country of data.countries) {
  const m = country.money;
  if (!m || !GEO[country.id]) continue;

  const w = wages?.wages[country.id];
  const dPct = deds?.deductions[country.id];

  if (w && (w.eur !== m.min_wage_eur || w.pps !== m.min_wage_pps)) {
    changes.push({
      country: country.name,
      what: "minimum wage",
      from: `€${m.min_wage_eur} (${m.min_wage_pps} local)`,
      to: `€${w.eur} (${w.pps} local)`,
    });
    oldValues.add(String(m.min_wage_eur));
    oldValues.add(String(m.min_wage_pps));
    if (WRITE) {
      m.min_wage_eur = w.eur;
      m.min_wage_pps = w.pps;
    }
  }

  if (dPct !== undefined && dPct !== m.deductions_pct) {
    changes.push({
      country: country.name,
      what: "deductions",
      from: `${m.deductions_pct}%`,
      to: `${dPct}%`,
    });
    oldValues.add(String(m.deductions_pct));
    if (WRITE) m.deductions_pct = dPct;
  }

  // Recompute the derived figures from whatever the current inputs are.
  if (WRITE && m.deductions_pct != null) {
    const net = round5(m.min_wage_eur * (1 - m.deductions_pct / 100));
    const factor = m.min_wage_eur / m.min_wage_pps;
    if (net !== m.net_eur_approx) oldValues.add(String(m.net_eur_approx));
    m.net_eur_approx = net;
    m.net_pps_approx = round5(net / factor);
  }
}

// Germany's figures feed the Ausbildung rows, which are compared against the
// countries in the same table. If Germany moved, they move too.
const de = data.countries.find((c) => c.id === "germany");
if (WRITE && de?.money?.min_wage_pps) {
  const factor = de.money.min_wage_eur / de.money.min_wage_pps;
  for (const row of data.europe_wide.money.ausbildung_rows || []) {
    if (!row.gross_eur) continue;
    // Nursing carries a small income-tax adjustment; everything else is just
    // the social insurance share.
    const isNursing = /nursing/i.test(row.name);
    const net = round5(row.gross_eur * (1 - AUSBILDUNG_SOC)) - (isNursing ? 10 : 0);
    row.net_eur_approx = net;
    row.net_pps_approx = round5(net / factor);
  }
}

if (wages) {
  bibb = await checkBibb(2025);
  if (bibb) {
    changes.push({
      country: "Germany",
      what: "BIBB training allowances",
      from: "2025 table",
      to: `${bibb.newYear} table published — the by-trade figures need re-reading by hand`,
    });
  }
}

// Any old figure still appearing anywhere in the file is almost certainly a
// sentence that now contradicts its own table. This is the check that matters
// most: the numbers update themselves, the prose around them does not.
const stale = [];
// Only meaningful once the figures have actually been replaced. Without
// --write the old values are still the table's own values, so every one of
// them would be reported as stale prose.
if (changes.length && WRITE) {
  const text = JSON.stringify(data);
  for (const v of oldValues) {
    if (!v || v.length < 3) continue;
    // Match the figure as a value in its own right. A plain substring search
    // reports "1233" inside "Directive (EU) 2024/1233", which sent us looking
    // for prose that was never there.
    const re = new RegExp(`(?<![\d/.,])${v.replace(".", "\.")}(?![\d/])`);
    if (re.test(text)) stale.push(v);
  }
}

if (WRITE && changes.length) {
  data.checked = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n");
}

// ---------------------------------------------------------------------------

const out = [];
if (changes.length) {
  out.push("**The figures behind the Europe page have moved.**", "");
  out.push("| Country | What | Was | Now |", "| --- | --- | --- | --- |");
  for (const c of changes)
    out.push(`| ${c.country} | ${c.what} | ${c.from} | ${c.to} |`);
  out.push("");
  if (wages) out.push(`Minimum wages read for period **${wages.period}** (dataset updated ${wages.updated}).`);
  if (deds) out.push(`Tax and social contributions read for **${deds.period}** (dataset updated ${deds.updated}).`);
  out.push("");
  if (stale.length) {
    out.push(
      "### Check the prose before merging",
      "",
      "These old figures still appear somewhere in `europe.json`, which usually",
      "means a sentence now contradicts its own table:",
      ""
    );
    for (const v of stale) out.push(`- \`${v}\``);
    out.push("");
  }
  out.push(
    "Before merging: read the changed rows against the page, update any",
    "sentence that quotes a figure by hand, and add a line to `SOURCES.md`",
    "with today's date.",
    ""
  );
} else {
  out.push("The figures behind the Europe page are unchanged.", "");
  if (wages) out.push(`- Minimum wages current for **${wages.period}**.`);
  if (deds) out.push(`- Tax and social contributions current for **${deds.period}**.`);
  out.push("");
}
if (warnings.length) {
  out.push("**Could not be checked this time** (not a failure):", "");
  for (const w of warnings) out.push(`- ${w}`);
  out.push("");
}

const report = out.join("\n");
console.log(report);
if (reportPath) fs.writeFileSync(reportPath, report);

process.exit(changes.length ? 1 : 0);
