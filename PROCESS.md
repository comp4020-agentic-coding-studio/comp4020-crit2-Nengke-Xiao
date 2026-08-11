# Process overview

A reading-guide to how the work came together — a map to your process, not an
essay about it.

## What I built

An unsolicited redesign of [sqlite.org](https://www.sqlite.org/) as a 9-page
static site (Home, About, Get Started, Documentation, SQL Syntax, C/C++ API,
FAQ, Download, Support) on the same plain HTML/CSS/TypeScript-on-Vite stack the
template ships with. The idea: keep SQLite's real content, colour identity, and
minimalist character, but give it a modern information architecture — a
Documentation hub as the entry point to the two references (SQL syntax, C/C++
API), consistent global navigation and footer, and a design-token system
(`styles.css`) driving typography, spacing, and colour so every page reads as
one coherent site rather than nine independently styled ones.

## The moments that mattered

1. **A hover-state colour swap silently broke WCAG contrast.**
   `.button-primary:hover` switched its background to `--color-accent`, which
   looked fine but computed to roughly 3.2:1 white-on-background contrast —
   under the 4.5:1 AA minimum for normal text. Nothing in `pnpm check` catches
   this (`CLAUDE.md` is explicit that accessibility sensors are my own
   responsibility to wire up), so I worked out the relative-luminance contrast
   by hand for the pairing. Instead of picking a second colour and having to
   re-verify it, I kept the existing, already-safe `--color-primary` background
   and used `filter: brightness(1.15)` on hover — a fix that stays accessible
   in both colour schemes without introducing a new value to check
   ([`1c69680`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Nengke-Xiao/commit/1c69680)).

2. **The same class of bug turned out to be sitewide.** While adding base
   heading styles during the final visual pass, I noticed `.hero h1` coloured
   itself with `--color-primary` — a token deliberately held constant across
   light and dark mode to keep the brand colour stable. That's fine against a
   white background, but against the dark-mode background it computes to
   about 1.9:1, and grepping for the same pattern showed it wasn't just
   headings: the default link colour, the header wordmark, `.tile h3`, and
   `.button-secondary` all used `--color-primary` as foreground text against a
   background that *does* change with the colour scheme. Rather than
   hardcoding a fix per selector, I added a `--color-heading` token that
   resolves to `--color-primary` in light mode (identical to before — zero
   visible change there) and to the already-legible dark-mode accent colour in
   dark mode, then swapped every foreground use over to it. I checked the
   fix by recomputing contrast for each affected pairing (links and headings
   against both `--color-bg` and `--color-surface`, in both schemes) before
   trusting it
   ([`7e79e96`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Nengke-Xiao/commit/7e79e96)).

3. **Scope discipline: link out rather than fabricate.** The brief asks for
   nine pages, not a full mirror of sqlite.org, so the Documentation hub's
   guide summaries and the Download page's binary/source sections both needed
   somewhere to send someone who wants more depth than this redesign covers. I
   deliberately linked those out to the real, current sqlite.org pages instead
   of inventing extra internal pages or a plausible-looking but fake download
   link — the same honesty pattern already established by the footer's link
   back to the original site
   ([`8bdd7d7`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Nengke-Xiao/commit/8bdd7d7),
   [`05e3772`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Nengke-Xiao/commit/05e3772)).

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that the
current reflection entry is in `reflections/`, and that your `CLAUDE.md` is
there — before a marker ever opens the file.
