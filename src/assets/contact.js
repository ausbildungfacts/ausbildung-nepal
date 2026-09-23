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
      out.textContent = "Please write what you want to tell us first.";
      out.className = "cf-out warnish";
      document.getElementById("cf-msg").focus();
      return;
    }

    // The permission is written into the email in both directions, never left
    // to be inferred from a missing line. The sender can read it before they
    // press send, and it is the only record either side has of what was agreed.
    var permission = mayPublish
      ? "I agree that you may publish what I have written here, without my name."
      : "Please do not publish this. It is private.";

    var subject =
      (about || "Message") +
      (page ? " — " + page : "") +
      (mayPublish ? " [may publish]" : "");

    var lines = [];
    if (page) lines.push("Page: " + page);
    lines.push("");
    lines.push(msg);
    if (seen) {
      lines.push("");
      lines.push("Where I saw something different:");
      lines.push(seen);
    }
    lines.push("");
    lines.push(permission);
    if (from) {
      lines.push("");
      lines.push("You can reply to me at: " + from);
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
        "Your message is too long for your email app to carry. Please copy the " +
        "text below, and email it to <strong>" + TO + "</strong>.";
      out.className = "cf-out warnish";

      var box = document.getElementById("cf-copy");
      if (!box) {
        box = document.createElement("textarea");
        box.id = "cf-copy";
        box.className = "cf-copy";
        box.setAttribute("rows", "10");
        box.setAttribute("readonly", "readonly");
        box.setAttribute("aria-label", "Your message, ready to copy");
        out.parentNode.insertBefore(box, out.nextSibling);
      }
      box.value = body;
      box.focus();
      box.select();
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
