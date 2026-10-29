---
layout: base.njk
title: The rest of Europe — what the other routes actually are
nav: Europe
order: 11
permalink: /europe/
standfirst: Germany is not the only country people in Nepal are being sold. It is, as far as we can find, the only one where you are paid from the first month and leave with a qualification. This page sets out what the others are, what they are not, and which ones are closed.
description: An honest comparison of legal routes from Nepal to European countries — work permits, training, seasonal work and au pair — with the source and the date checked for every country.
reviewed: October 2026
---

{%- set eu = europe %}

Almost every guide to working in Europe is written by somebody who is paid if you
go. This one is not. Everything here has a source and a date, both printed next
to the claim, and where we do not know something we say so instead of filling the
gap.

One number explains why this page exists. In the Nepali year 2025/26, Nepal
issued **{{ eu.nepal_figures.europe_total | num }}** new labour approvals for Europe.
Romania alone took **{{ 24767 | num }}** of them. Germany — the route this
website is mostly about, the one that pays a wage and ends in a qualification —
took **316**.

So the route with the best terms is the one almost nobody from Nepal actually
gets, and the routes people do take are mostly short, tied to one employer, and
end with no qualification at all. That is the honest shape of it.

<div class="warn">

**Before anything else.** Over the same year, **{{ eu.nepal_figures.complaints | num }}
people** filed complaints about European employment fraud, claiming
**Rs {{ eu.nepal_figures.compensation_claimed_npr / 10000000 }} crore** between
them. Workers going to Europe are reported to be paying individual agents
**Rs {{ eu.nepal_figures.agent_fees_npr_range }}** — and most go on individual
visas rather than through any registered channel, which is why there is so often
nobody to complain to afterwards.

</div>

## How to read this page

Every country below carries a **date we last checked it** and the sources we
read. The grades mean:

- **Primary** — read on the page of the authority that actually decides, or in
  the law itself
- **Official** — read on an official EU source, which can be months out of date
- **Secondary** — a reliable report, but not the original document
- **Open** — we asked and do not yet know. Never plan around an open item.

Where a country's entry says *not checked*, that is not a hint that the answer is
bad. It means we have not read it, and we would rather look unfinished than make
something up.

<div class="warn">

**About wages.** Every wage figure on this page is a **statutory minimum**, from
Eurostat, and it is **gross** — before tax, before social insurance, and before
anything your employer takes for food or a bed. It is a floor, not a salary, and
in some sectors it does not apply at all. What we still do not have is what each
particular job actually pays. If you have been quoted a wage for one of these
countries, [tell us](/contact/) and we will check it against the legal minimum
and publish what we find.

</div>

## The comparison

Two columns decide almost everything: whether you finish with a qualification
that belongs to you, and whether the European rules that protect workers reach
your route at all.

<div class="scroll">

| Country | New approvals 2025/26 | Ends in a qualification? | European work rights? | Checked |
| --- | --- | --- | --- | --- |
{%- for c in eu.countries %}
| **{{ c.name }}** | {% if c.nepal_permits %}{{ c.nepal_permits | num }}{% else %}—{% endif %} | {% if c.qualification %}{{ c.qualification.answer }}{% else %}No{% endif %} | {% if c.single_permit.status == "carried" %}Yes{% elif c.single_permit.status == "carved_out" %}**No — left out**{% elif c.single_permit.status == "mixed" %}Depends on the route{% elif c.single_permit.status == "not_applicable" %}Outside the EU rules{% else %}Unresolved{% endif %} | {{ c.checked }} |
{%- endfor %}

</div>

A dash in the approvals column means we do not have a figure, not that nobody
goes. The figures come from Nepal's own labour approval data for 2025/26,
reported by the Kathmandu Post — they count one year of new approvals, not how
many Nepalis live in a country.


## {{ eu.europe_wide.language.name }}

{{ eu.europe_wide.language.lede }}

### {{ eu.europe_wide.language.what_b1_means.heading }}

{{ eu.europe_wide.language.what_b1_means.text }}

<div class="warn">

{{ eu.europe_wide.language.what_b1_means.the_catch }}

</div>

{{ eu.europe_wide.language.what_b1_means.plus_the_queue }}

### {{ eu.europe_wide.language.two_gates.heading }}

{{ eu.europe_wide.language.two_gates.text }}

<div class="scroll">

| Country | To get in | To stay for good |
| --- | --- | --- |
{%- for r in eu.europe_wide.language.rows %}
| **{{ r.country }}** | {{ r.before }} | {{ r.after }} |
{%- endfor %}

</div>

{% for r in eu.europe_wide.language.rows %}{% if r.note %}
- **{{ r.country }}** — {{ r.note }}
{%- endif %}{% endfor %}

### {{ eu.europe_wide.language.if_german_is_not_realistic.heading }}

{{ eu.europe_wide.language.if_german_is_not_realistic.text }}

<div class="warn">

{{ eu.europe_wide.language.if_german_is_not_realistic.the_trade }}

</div>

{{ eu.europe_wide.language.if_german_is_not_realistic.worth_knowing }}

<p class="open-line"><span class="badge open">Open</span> What we have not
settled about language:</p>

{% for o in eu.europe_wide.language.open %}
- {{ o }}
{%- endfor %}

{%- for s in eu.europe_wide.language.sources %}

<p class="src-line"><span class="badge {% if s.status == 'primary' %}primary{% elif s.status == 'official' %}authority{% else %}secondary{% endif %}">{{ s.status }}</span>
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.</p>
{%- endfor %}

## {{ eu.europe_wide.money.name }}

{{ eu.europe_wide.money.summary }}

<div class="scroll">

| Country | Gross minimum wage | Roughly what you keep | What that buys locally |
| --- | --- | --- | --- |
{%- for c in eu.countries | sortBy("money.net_eur_approx", true) %}{% if c.money and c.money.net_eur_approx %}
| **{{ c.name }}** | €{{ c.money.min_wage_eur | num }} | **about €{{ c.money.net_eur_approx | num }}** | {{ c.money.net_pps_approx | num }} |
{%- endif %}{% endfor %}
{%- for a in eu.europe_wide.money.ausbildung_rows %}
| **{{ a.name }}** | €{{ a.gross_eur | num }} | **about €{{ a.net_eur_approx | num }}** | {{ a.net_pps_approx | num }} |
{%- endfor %}

</div>

<p class="src-line">{{ eu.europe_wide.money.ausbildung_rows_footnote }}</p>

{{ eu.europe_wide.money.table_note }}

{{ eu.europe_wide.money.deductions_explainer }}

### {{ eu.europe_wide.money.what_changes.heading }}

{{ eu.europe_wide.money.what_changes.text }}

### {{ eu.europe_wide.money.net_method.heading }}

{{ eu.europe_wide.money.net_method.text }}

{% for c in eu.europe_wide.money.net_method.caveats %}
- {{ c }}
{%- endfor %}

{{ eu.europe_wide.money.pps_explainer }}

### {{ eu.europe_wide.money.straight_answer.heading }}

{{ eu.europe_wide.money.straight_answer.text }}

**{{ eu.europe_wide.money.straight_answer.caveats_heading }}:**

{% for c in eu.europe_wide.money.straight_answer.caveats %}
- {{ c }}
{%- endfor %}

### {{ eu.europe_wide.money.ausbildung_caveat.heading }}

{{ eu.europe_wide.money.ausbildung_caveat.text }}

<div class="warn">

{{ eu.europe_wide.money.ausbildung_caveat.conclusion }}

</div>

<p class="src-line">{{ eu.europe_wide.money.ausbildung_caveat.arithmetic_note }}</p>

### {{ eu.europe_wide.money.ausbildung_wages.heading }}

{{ eu.europe_wide.money.ausbildung_wages.intro }}

{{ eu.europe_wide.money.ausbildung_wages.average_note }}

<div class="scroll">

| Trade | First year, gross | Roughly what you keep |
| --- | --- | --- |
{%- for r in eu.europe_wide.money.ausbildung_wages.rows %}
| **{{ r.name }}** | {% if r.gross_eur %}€{{ r.gross_eur | num }}{% else %}**no legal minimum**{% endif %} | {% if r.net_eur_approx %}about €{{ r.net_eur_approx | num }}{% else %}—{% endif %} |
{%- endfor %}

</div>

{% for r in eu.europe_wide.money.ausbildung_wages.rows %}{% if r.note %}
- **{{ r.name }}** — {{ r.note }}
{%- endif %}{% endfor %}

### {{ eu.europe_wide.money.ausbildung_wages.mechatroniker_note.heading }}

{{ eu.europe_wide.money.ausbildung_wages.mechatroniker_note.text }}

<div class="warn">

{{ eu.europe_wide.money.ausbildung_wages.mechatroniker_note.advice }}

</div>

### {{ eu.europe_wide.money.ausbildung_wages.nursing_note.heading }}

{{ eu.europe_wide.money.ausbildung_wages.nursing_note.lede }}

{{ eu.europe_wide.money.ausbildung_wages.nursing_note.why }}

**So what you are paid depends entirely on who employs you:**

{% for w in eu.europe_wide.money.ausbildung_wages.nursing_note.what_this_means %}
- {{ w }}
{%- endfor %}

{{ eu.europe_wide.money.ausbildung_wages.nursing_note.leverage }}

#### {{ eu.europe_wide.money.ausbildung_wages.nursing_note.sachbezug.heading }}

{{ eu.europe_wide.money.ausbildung_wages.nursing_note.sachbezug.text }}

<div class="warn">

{{ eu.europe_wide.money.ausbildung_wages.nursing_note.sachbezug.worked }}

</div>

{{ eu.europe_wide.money.ausbildung_wages.nursing_note.sachbezug.protection }}

<p class="open-line"><span class="badge open">Open</span>
{%- for o in eu.europe_wide.money.ausbildung_wages.nursing_note.open %}{{ o }} {% endfor %}</p>

{%- for s in eu.europe_wide.money.ausbildung_wages.nursing_note.sources %}

<p class="src-line"><span class="badge {% if s.status == 'primary' %}primary{% elif s.status == 'official' %}authority{% else %}secondary{% endif %}">{{ s.status }}</span>
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.</p>
{%- endfor %}

### {{ eu.europe_wide.money.ausbildung_wages.construction_note.heading }}

{{ eu.europe_wide.money.ausbildung_wages.construction_note.text }}

{{ eu.europe_wide.money.ausbildung_wages.construction_note.shortage_honesty }}

<div class="warn">

{{ eu.europe_wide.money.ausbildung_wages.construction_note.dropout_warning }}

</div>

<p class="open-line"><span class="badge open">Open</span>
{%- for o in eu.europe_wide.money.ausbildung_wages.construction_note.open %}{{ o }} {% endfor %}</p>

{%- for s in eu.europe_wide.money.ausbildung_wages.construction_note.sources %}

<p class="src-line"><span class="badge primary">{{ s.status }}</span>
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.</p>
{%- endfor %}

{{ eu.europe_wide.money.ausbildung_wages.craft_vs_industry }}

<div class="warn">

{{ eu.europe_wide.money.ausbildung_wages.floor_warning }}

</div>

{{ eu.europe_wide.money.ausbildung_wages.trades_caveat }}

{%- for s in eu.europe_wide.money.ausbildung_wages.sources %}

<p class="src-line"><span class="badge {% if s.status == 'primary' %}primary{% else %}secondary{% endif %}">{{ s.status }}</span>
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.</p>
{%- endfor %}


### Working out your own number

{% for st in eu.europe_wide.money.steps %}
{{ loop.index }}. {{ st }}
{%- endfor %}

### {{ eu.europe_wide.money.accommodation_rights.heading }}

{{ eu.europe_wide.money.accommodation_rights.text }}

<div class="warn">

{{ eu.europe_wide.money.accommodation_rights.honest_caveat }}

</div>

### {{ eu.europe_wide.money.commission_on_agents.heading }}

{{ eu.europe_wide.money.commission_on_agents.text }}

{{ eu.europe_wide.money.commission_on_agents.why_it_matters }}

<p class="open-line"><span class="badge open">Open</span> What we still cannot
tell you about money:</p>

{% for o in eu.europe_wide.money.open %}
- {{ o }}
{%- endfor %}

{%- for s in eu.europe_wide.money.sources %}

<p class="src-line"><span class="badge {% if s.status == 'primary' %}primary{% else %}authority{% endif %}">{{ s.status }}</span>
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.</p>
{%- endfor %}


## The rights nobody is going to tell you about

This is the most useful part of the page, and it is the part no agent will
mention, because it is about what you can do **after** you have paid them.

If you work in an EU country on an ordinary work permit, the rights below are
yours under **{{ eu.europe_wide.single_permit.law }}**. Every EU country was
supposed to have them in its own law by
**{{ eu.europe_wide.single_permit.transposed_by }}**. Some were late — Austria
was three weeks late, Greece was early.

{% for r in eu.europe_wide.single_permit.rights %}
- {{ r }}
{%- endfor %}

**On fees.** {{ eu.europe_wide.single_permit.fee_rule }}

<div class="warn">

**{{ eu.europe_wide.single_permit.carved_out_warning }}**

The law leaves out:

{% for c in eu.europe_wide.single_permit.carved_out %}
- {{ c }}
{%- endfor %}

</div>

{%- for o in eu.europe_wide.single_permit.open %}

**Still open.** {{ o }}
{%- endfor %}

<p class="src-line"><span class="badge primary">Primary</span>
{%- for s in eu.europe_wide.single_permit.sources %}
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.
{%- endfor %}</p>

### Five years is the real prize

{{ eu.europe_wide.long_term_residence.summary }}

### {{ eu.europe_wide.talent_pool.name }}

{{ eu.europe_wide.talent_pool.summary }} It became law on
**{{ eu.europe_wide.talent_pool.in_force }}** as
{{ eu.europe_wide.talent_pool.law }}.

{% for k in eu.europe_wide.talent_pool.key_points %}
- {{ k }}
{%- endfor %}

{{ eu.europe_wide.talent_pool.shortage_occupations_note }}

<div class="warn">

{{ eu.europe_wide.talent_pool.honest_caveat }}

</div>

<p class="src-line"><span class="badge primary">Primary</span>
{%- for s in eu.europe_wide.talent_pool.sources %}
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.
{%- endfor %}</p>

---

## Routes that end in a qualification

There are very few. We have found three countries worth writing about, and one
of the three turns out not to be a route at all.

{% for c in eu.countries %}{% if c.group == "training" and c.detail %}
### {{ c.name }}

<p class="checked-line">Last checked {{ c.checked }}{% if c.nepal_permits %} &middot; {{ c.nepal_permits | num }} new Nepali labour approvals in 2025/26{% endif %}</p>

**{{ c.headline }}**

{% include "country-body.njk" %}
{% endif %}{% endfor %}

---

## The countries Nepalis actually go to

These are the eight destinations that account for most Nepali labour approvals
for Europe. None of them ends in a qualification.

{% for c in eu.countries %}{% if c.group == "work" and c.detail %}
### {{ c.name }}

<p class="checked-line">Last checked {{ c.checked }}{% if c.nepal_permits %} &middot; {{ c.nepal_permits | num }} new Nepali labour approvals in 2025/26{% endif %}</p>

**{{ c.headline }}**

{% include "country-body.njk" %}
{% endif %}{% endfor %}

---

## Shorter entries

Some of these are being actively sold in Nepal. One of them is closed to Nepali
citizens entirely.

{% for c in eu.countries %}{% if not c.detail %}
### {{ c.name }}

<p class="checked-line">Last checked {{ c.checked }}{% if c.nepal_permits %} &middot; {{ c.nepal_permits | num }} new Nepali labour approvals in 2025/26{% endif %}</p>

**{{ c.headline }}**

{{ c.brief }}

{%- if c.health_note %}

**Health and care work.** {{ c.health_note }}
{%- endif %}

{%- if c.open and c.open.length %}

<p class="open-line"><span class="badge open">Open</span>
{%- for o in c.open %}{{ o }} {% endfor %}</p>
{%- endif %}

{%- if c.sources and c.sources.length %}
{%- for s in c.sources %}

<p class="src-line"><span class="badge {% if s.status == 'primary' %}primary{% elif s.status == 'official' %}authority{% else %}secondary{% endif %}">{{ s.status }}</span>
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.</p>
{%- endfor %}
{%- else %}

<p class="src-line"><span class="badge secondary">No source yet</span>
This entry has no source list because it rests on general reporting we have not
pinned down. Treat it as a pointer for your own checking, not as information.</p>
{%- endif %}
{% endif %}{% endfor %}

---

## Au Pair, across Europe

{{ eu.au_pair.intro }}

<div class="warn">

An au pair placement is childcare. On its own it leads to no qualification in any
of these countries. In Germany it can be a step towards an Ausbildung, which is
why we have [a whole page about it]({{ eu.au_pair.see_also.url }}) — and why the
reason it is usually suggested is the wrong one.

</div>

{% for a in eu.au_pair.countries %}
### {{ a.name }} — {{ a.status }}

<p class="checked-line">Last checked {{ a.checked }}</p>

{{ a.text }}

{%- if a.open and a.open.length %}

<p class="open-line"><span class="badge open">Open</span>
{%- for o in a.open %}{{ o }} {% endfor %}</p>
{%- endif %}

{%- for s in a.sources %}

<p class="src-line"><span class="badge primary">Primary</span>
{{ s.label }} — <a class="src" href="{{ s.url }}">source</a>. Checked {{ s.checked }}.</p>
{%- endfor %}
{% endfor %}

---

## Other things people ask about

{% for o in eu.other_routes %}
**{{ o.name }}.** {{ o.text }}
{% endfor %}

---

## How the scams work

Every one of these has something you can actually check. That is the point: you
do not have to decide whether to trust somebody, you only have to ask them for
one verifiable thing.

{% for s in eu.scam_patterns %}
**{{ s.pattern }}**

{{ s.check }}
{% endfor %}

<div class="warn">

**One rule that covers most of it.** Nobody can sell you a government
appointment, nobody can sell you a place in a queue, and in Germany nobody may
lawfully charge you for arranging an Ausbildung at all — that fee may only be
taken from the employer. See [what you should pay, and what you should
not](/no-fees/).

Paying a teacher who actually teaches you is normal. Paying somebody several lakh
to forward your documents is not. The difference is whether they can tell you,
in writing, exactly what each part of the fee is for and what happens to your
money if the visa is refused.

</div>

## Where this page came from

Every claim above carries its own source and date. The figures for how many
Nepalis go where are from Nepal's own Department of Foreign Employment data for
2025/26, as reported by the Kathmandu Post on 16 July 2026 — press reporting of
government figures, so **secondary**:
[the report]({{ eu.nepal_figures.source.url }}).

The country data lives in a single file, `src/_data/europe.json`, kept separately
from this page so that a rule change is a one-line edit and the sources travel
with it. Both that file and
[SOURCES.md](https://github.com/ausbildungfacts/ausbildung-nepal/blob/main/SOURCES.md)
are in [the public repository for this
site](https://github.com/ausbildungfacts/ausbildung-nepal), where you can read
every claim and check us on it.

<div class="warn">

**This page is less certain than the rest of this site.** The German pages rest
on the embassy's own replies and on statutes we have read. This page covers
twenty-two countries, and for several of them our best source is an EU summary
that was last updated in April 2025 or a law firm's note. Everything we have not
confirmed is marked **open**. If you are planning around any country here other
than Germany, read that country's own immigration website before you spend
money — and if you find we are wrong, [please tell us](/contact/).

</div>
