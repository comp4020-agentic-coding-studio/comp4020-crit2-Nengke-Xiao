import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Crit 2 (unsolicited redesign): the checkable half of the spec at
// https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/02-unsolicited-redesign/
// The rest — is the org real, is yours actually better, did you rewrite rather
// than paste — is judged at the crit, not here.
const DIST = resolve("dist");

function htmlFiles(dir: string = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

const pages = htmlFiles().map(
  (path) => new JSDOM(readFileSync(path, "utf8")).window.document,
);

describe("crit 2: unsolicited redesign", () => {
  it("links out to the real organisation's current site", () => {
    const found = pages.some((doc) =>
      doc.querySelector("a[data-original-site]"),
    );
    expect(
      found,
      'no a[data-original-site] found on any page — mark the link to the org\'s existing site with that attribute so it stays checkable',
    ).toBe(true);
  });

  it("gives a way to find the organisation", () => {
    const found = pages.some((doc) =>
      doc.querySelector('address, a[href^="mailto:"], a[href^="tel:"]'),
    );
    expect(
      found,
      "no <address>, mailto: or tel: link found — give a way to find them, per the brief",
    ).toBe(true);
  });
});
