---
layout: base.njk
title: Tell us something
permalink: /contact/
templateEngineOverride: md
noinvite: true   # This page IS the invitation. Repeating it at the foot would be absurd.
standfirst: Especially if we have got something wrong. This site is only worth reading if it is correct, and the fastest way it gets corrected is somebody telling us.
description: Contact the people who write this site — to report an error, ask a question, or tell us what happened to you.
reviewed: September 2026
---

Write to **[info@ausbildungfacts.org](mailto:info@ausbildungfacts.org)**, or
use the form below, which fills in an email for you.

## What is most useful to hear

**Something on this site is wrong or out of date.** This is the most valuable
message you can send. Rules change, embassies change their pages, and we have
already been wrong more than once. Tell us the page and what you saw instead, and
we will check it against the source and either correct the page or explain why it
stands.

**An official told you something different.** If the embassy, a chamber, an
Ausländerbehörde or a vocational school told you something that contradicts a
page here, that is worth more than any research we can do. Say who told you and
when.

**Something happened to you.** What you were charged, how long you waited, what
an institute promised and what it actually did. Numbers are especially useful:
the figure you were quoted, the date, the queue position. Twenty people telling
us what they were asked to pay is evidence no agency's website will ever print.

**You found a real programme or organisation.** Particularly a Nepali
organisation that is a weltwärts partner, or a free route we have missed.

## What we cannot do

We cannot advise you on your own case, and we are not lawyers. We cannot find you
a training place, contact an employer for you, or speak to an embassy on your
behalf. We are not an agency, and we take no money from anyone.

If you send us a personal question, you may get a slow answer or a link to the
page that covers it. That is not rudeness — it is a very small project.

<div class="warn">

**What happens to what you tell us.** By default, nothing: we do not publish it,
we do not name you, and we never pass it to an employer, an institute, an agency
or an authority. That does not change whether you tick the box or not.

**The box in the form is the only thing that lets us publish anything.** If you
tick it, you are telling us we may use what you have written on the site —
**never with your name, your email address, or anything else that could identify
you**, and often only a part of it, or just a figure taken from it. We still
decide what is worth publishing, so ticking it does not mean it will be used.

**You can change your mind at any time.** Write to us and we will take it down.
You do not have to give a reason.

</div>

<link rel="stylesheet" href="/assets/contact.css">

<form id="cf" class="cf">
<div class="cf-field"><label for="cf-about">What is this about?</label><select id="cf-about"><option>Something on the site is wrong</option><option>An official told me something different</option><option>Something that happened to me</option><option>A programme or organisation you have missed</option><option>A question</option><option>Something else</option></select></div>
<div class="cf-field"><label for="cf-page">Which page? <span class="hint">Optional — the title or the address of the page.</span></label><input id="cf-page" type="text" placeholder="for example: Visa and waiting"></div>
<div class="cf-field"><label for="cf-msg">What do you want to tell us?</label><textarea id="cf-msg" rows="6" placeholder="Write in English or German, whichever is easier."></textarea></div>
<div class="cf-field"><label for="cf-seen">Where did you see something different? <span class="hint">Optional — a link, a letter, or the name of the office that told you.</span></label><input id="cf-seen" type="text"></div>
<div class="cf-field cf-check"><label for="cf-pub"><input id="cf-pub" type="checkbox"><span><strong>You may publish this.</strong><span class="hint">Tick this and we may use what you have written on the site, so that other people can learn from it — without your name, your email address, or anything that identifies you. We may use only part of it. Leave it unticked and it stays private. You can ask us to remove it later.</span></span></label></div>
<div class="cf-field"><label for="cf-from">Your email address <span class="hint">Optional. Only needed if you want an answer.</span></label><input id="cf-from" type="email" placeholder="you@example.com"></div>
<button class="cf-btn" type="submit">Write this email</button>
<p id="cf-out" class="cf-out"></p>
</form>

<script src="/assets/contact.js" defer></script>

**How this form works, plainly.** It does not send anything by itself and it
uploads nothing. When you press the button it opens your own email app with the
message already written, and **you** press send. Nothing you type here reaches us
until you do. Whether you ticked the box or not is written into that email in
plain words, so you can see it before you send, and change it if it is wrong. If
your phone has no email app set up, just write to
[info@ausbildungfacts.org](mailto:info@ausbildungfacts.org) directly — it is
the same address.
