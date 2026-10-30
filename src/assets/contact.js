(function () {
  "use strict";
  var TO = "info@ausbildungfacts.org";
  var form = document.getElementById("cf");
  if (!form) return;

  var out = document.getElementById("cf-out");

  // Every sentence this script writes into the email, or shows the sender,
  // comes from here. The Nepali page carries its own set in data- attributes
  // on the form, because of the promise the page makes: that the sender can
  // READ the permission line before they press send, and change it if it is
  // wrong. An English line in a Nepali form breaks that promise, and the
  // permission line is the only record either side has of what was agreed.
  //
  // English is the default, so the English page behaves exactly as before.
  function s(key, fallback) {
    var v = form.getAttribute("data-" + key);
    return v === null || v === "" ? fallback : v;
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function checked(id) {
    var el = document.getElementById(id);
    return !!(el && el.checked);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var about = val("cf-about");
    var page = val("cf-page");
    var msg = val("cf-msg");
    var seen = val("cf-seen");
    var from = val("cf-from");
    var mayPublish = checked("cf-pub");

    if (!msg) {
      out.textContent = s("need-msg", "Please write what you want to tell us first.");
      out.className = "cf-out warnish";
      document.getElementById("cf-msg").focus();
      return;
    }

    // The permission is written into the email in both directions, never left
    // to be inferred from a missing line. The sender can read it before they
    // press send, and it is the only record either side has of what was agreed.
    var permission = mayPublish
      ? s("perm-yes", "I agree that you may publish what I have written here, without my name.")
      : s("perm-no", "Please do not publish this. It is private.");

    var subject =
      (about || s("subject-default", "Message")) +
      (page ? " — " + page : "") +
      (mayPublish ? " [may publish]" : "");

    var lines = [];
    if (page) lines.push(s("l-page", "Page:") + " " + page);
    lines.push("");
    lines.push(msg);
    if (seen) {
      lines.push("");
      lines.push(s("l-seen", "Where I saw something different:"));
      lines.push(seen);
    }
    lines.push("");
    lines.push(permission);
    if (from) {
      lines.push("");
      lines.push(s("l-reply", "You can reply to me at:") + " " + from);
    }

    var body = lines.join("\n");

    var href =
      "mailto:" + TO +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    // Some browsers cap mailto length and silently truncate the body, which
    // would drop the permission line off the end. Rather than risk that, hand
    // the whole message back to be copied — including that line.
    if (href.length > 1900) {
      out.innerHTML =
        s("too-long",
          "Your message is too long for your email app to carry. Please copy the " +
          "text below, and email it to") + " <strong>" + TO + "</strong>.";
      out.className = "cf-out warnish";

      var box = document.getElementById("cf-copy");
      if (!box) {
        box = document.createElement("textarea");
        box.id = "cf-copy";
        box.className = "cf-copy";
        box.setAttribute("rows", "10");
        box.setAttribute("readonly", "readonly");
        box.setAttribute("aria-label", s("l-copybox", "Your message, ready to copy"));
        out.parentNode.insertBefore(box, out.nextSibling);
      }
      box.value = body;
      box.focus();
      box.select();
      return;
    }

    window.location.href = href;
    out.innerHTML =
      s("opened-a",
        "Your email app should have opened with the message ready. If nothing " +
        "happened, write to") + " <strong>" + TO + "</strong> " +
      s("opened-b", "instead — that is the same address this form uses.");
    out.className = "cf-out";
  });
})();
