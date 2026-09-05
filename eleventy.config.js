export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  // GitHub Pages reads the custom domain from a CNAME file in the built output,
  // so it has to survive the build rather than live only in the repo root.
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // The top navigation. A page is in the nav if — and only if — it gives itself
  // a `nav:` label in its front matter, and they are ordered by the `order`
  // value so the nav reads in a sensible sequence rather than alphabetically.
  //
  // The imprint, privacy and contact pages simply have no `nav:`, which is what
  // keeps them out of the menu. They deliberately do NOT use
  // `eleventyExcludeFromCollections`, because that would also hide them from
  // `collections.all` — and sitemap.njk builds the sitemap from that, so an
  // excluded page would silently go missing from sitemap.xml.
  eleventyConfig.addCollection("pages", (collection) =>
    collection
      .getFilteredByGlob("src/**/*.md")
      .filter((page) => page.data.nav)
      .sort((a, b) => (a.data.order || 99) - (b.data.order || 99))
  );

  // Our own hostnames. Anything else is somebody else's site.
  const OWN_HOSTS = new Set(["ausbildungfacts.org", "www.ausbildungfacts.org"]);

  // Every link that leaves this site opens in a new tab and carries
  // rel="nofollow noopener noreferrer". Done here at build time rather than by
  // hand in the markdown: a rule nobody has to remember is a rule that does not
  // quietly lapse the next time someone adds a source.
  //
  // nofollow because we link to statutes, embassies and ministries as evidence,
  // not as endorsement — and because a site that may one day mention language
  // schools or employers must never be worth anything to buy a link on.
  // noopener/noreferrer close the window.opener hole on the way past.
  //
  // Internal links, page anchors, mailto: and our own domain are left alone.
  // A regex is the right tool here: the input is our own generated markup.
  eleventyConfig.addTransform("externalLinks", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;

    return content.replace(
      /<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi,
      (whole, before, href, after) => {
        try {
          if (OWN_HOSTS.has(new URL(href).hostname.toLowerCase())) return whole;
        } catch {
          return whole; // not a URL we can parse — leave it exactly as written
        }

        let attrs = before + after;

        // Merge with any rel already on the tag rather than emitting a second one.
        const rel = new Set(["nofollow", "noopener", "noreferrer"]);
        attrs = attrs.replace(/\srel="([^"]*)"/i, (_m, existing) => {
          existing
            .split(/\s+/)
            .filter(Boolean)
            .forEach((v) => rel.add(v.toLowerCase()));
          return " ";
        });
        attrs = attrs.replace(/\starget="[^"]*"/i, " ");

        const tidy = attrs.replace(/\s+/g, " ").trim();
        const lead = tidy ? tidy + " " : "";
        return `<a ${lead}href="${href}" rel="${[...rel].join(" ")}" target="_blank">`;
      }
    );
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
