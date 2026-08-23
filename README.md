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

## Local preview (optional)

    npm install
    npm run serve

## Going live

The repository starts private. GitHub Pages on the free plan requires a public
repository, so publishing means making it public first.
