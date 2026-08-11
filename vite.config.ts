import { basename } from "node:path";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";

// Every .html file in the repo is a page and a build entry, so a multi-page
// hand-written site needs no build config: add pages, link them, ship.
// (Vite's default would build only the root index.html and silently drop the
// rest from dist/ — fine locally, 404s deployed.)
// `partials/` holds shared header/footer fragments, not standalone pages, so
// it's excluded from the page scan the same way spec/scripts/reflections are.
const SKIP = new Set([
  "node_modules",
  "dist",
  "spec",
  "scripts",
  "reflections",
  "partials",
]);

function htmlEntries(dir = "."): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || SKIP.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlEntries(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

// Every page has `<!--#include header-->` / `<!--#include footer-->` markers
// in place of a hand-copied header/footer. This resolves them at dev/build
// time from partials/header.html and partials/footer.html, so the nav and
// footer are written once instead of duplicated across nine pages. The
// output is still plain static HTML with no include left in it — no
// client-side script is needed to render the nav, so it still works with JS
// disabled and for screen readers.
function includePartials(): Plugin {
  const header = readFileSync("partials/header.html", "utf8");
  const footer = readFileSync("partials/footer.html", "utf8");

  return {
    name: "include-partials",
    transformIndexHtml(html, ctx) {
      const page = basename(ctx.filename, ".html");
      // Anchored to `<li><a href=...` so this only ever matches a nav item,
      // never the wordmark link, which points at the same href for Home.
      const target = `<li><a href="./${page}.html"`;
      const currentHeader = header.replace(
        target,
        `${target} aria-current="page"`,
      );
      return html
        .replace("<!--#include header-->", currentHeader)
        .replace("<!--#include footer-->", footer);
    },
  };
}

// `base: "./"` makes built asset URLs relative, so the site works under any
// GitHub Pages path (username.github.io/your-repo/) without further config.
export default defineConfig({
  base: "./",
  plugins: [includePartials()],
  build: {
    rollupOptions: {
      input: htmlEntries(),
    },
  },
});
