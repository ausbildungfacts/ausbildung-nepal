export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  // GitHub Pages reads the custom domain from a CNAME file in the built output,
  // so it has to survive the build rather than live only in the repo root.
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // Pages are ordered by the `order` value in their front matter, so the nav
  // reads in a sensible sequence rather than alphabetically.
  eleventyConfig.addCollection("pages", (collection) =>
    collection
      .getFilteredByGlob("src/**/*.md")
      .sort((a, b) => (a.data.order || 99) - (b.data.order || 99))
  );

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
