(function () {
  "use strict";
  var TO = "info@ausbildungfacts.org";
  var form = document.getElementById("cf");
  if (!form) return;

  var out = document.getElementById("cf-out");

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var about = val("cf-about");
    var page = val("cf-page");
    var msg = val("cf-msg");
    var seen = val("cf-seen");
    var from = val("cf-from");

    if (!msg) {
      out.textContent = "Please write what you want to tell us first.";
      out.className = "cf-out warnish";
      document.getElementById("cf-msg").focus();
      return;
    }

    var subject = (about || "Message") + (page ? " — " + page : "");
    var lines = [];
    if (page) lines.push("Page: " + page);
    lines.push("");
    lines.push(msg);
    if (seen) {
      lines.push("");
      lines.push("Where I saw something different:");
      lines.push(seen);
    }
    if (from) {
      lines.push("");
      lines.push("You can reply to me at: " + from);
    }

    var href =
      "mailto:" + TO +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));

    // Some browsers cap mailto length; fall back to showing the text to copy.
    if (href.length > 1900) {
      out.innerHTML =
        "Your message is long, so your email app may cut it off. Please email " +
        "<strong>" + TO + "</strong> directly and paste your text in.";
      out.className = "cf-out warnish";
      return;
    }

    window.location.href = href;
    out.innerHTML =
      "Your email app should have opened with the message ready. If nothing " +
      "happened, write to <strong>" + TO + "</strong> instead — that is the " +
      "same address this form uses.";
    out.className = "cf-out";
  });
})();
