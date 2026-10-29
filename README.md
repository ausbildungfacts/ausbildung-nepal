# Ausbildung in Germany — information for students in Nepal

A small static site. Honest, sourced information about vocational training in
Germany for people in Nepal considering it. It sells nothing and takes no fee
from students.

## How it is maintained

Content lives in `src/` as Markdown. Claude edits those files, commits, and
pushes; GitHub Actions builds the site and publishes it. Nothing needs to be
installed on Alan's PC and no editor has to be opened.

**Every factual claim must have a line in `SOURCES.md`** with its source and the
date it was checked. Claims marked OPEN must not be stated as settled on the
site. This is the one rule that matters here — readers plan a year of their life
around these pages.

## The three automatic checks

Nothing here depends on anybody remembering to look.

| What it asks | Script | When | What it does |
| --- | --- | --- | --- |
| Does the cited URL still resolve? | `check-links` | Mondays | Opens an issue naming what died, closes it when fixed |
| Does the page still **say** what we told readers it says? | `check-watch` | Daily | Opens an issue; closed by hand, because a wording change needs a human |
| Are the **figures** still current? | `check-figures` | Monthly | Opens a **pull request** with the new numbers and a list of sentences to re-read |

The third one is the only one that proposes a fix, because Eurostat publishes
minimum wages and tax rates in a form a script can read and write back. It never
publishes on its own: it updates `src/_data/europe.json`, leaves the prose
alone, and tells you which sentences now quote a figure that moved.

Run any of them by hand:

    npm run check-links
    npm run check-watch
    npm run check-figures

## Local preview (optional)

    npm install
    npm run serve

## Going live

The repository starts private. GitHub Pages on the free plan requires a public
repository, so publishing means making it public first.
