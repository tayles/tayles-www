---
name: new-design
description: Invent, build, screenshot and ship a brand-new design for tayles.co.uk. Use when asked to add a design, generate this week's design, or run the weekly design routine. Accepts an optional free-text steer, e.g. "/new-design vaporwave with a koi pond".
---

# New design

Add one new design to `src/designs/`, verify it, screenshot it, and open a PR
that auto-merges when CI passes.

`$ARGUMENTS` is an **optional steer** — a mood, era, colour, technique or
subject. Honour it fully when given, and still make it beautiful. With no
arguments, choose for yourself.

Read `CLAUDE.md` first — it holds the hard requirements that every design has
to meet, and this skill assumes them.

## 1. Learn what already exists

```bash
cat src/designs/*/index.md
```

Note every `tags:` line. **The new design must not repeat a direction that is
already there.** If the last three designs are all dark, make a light one; if
they are all typographic, make one that is illustrative or interactive. Vary:

- **Palette** — dark / light / monochrome / hot / pastel / earthy / duotone
- **Type** — display, serif, mono, script, pixel, variable, no type at all
- **Technique** — pure CSS, canvas, SVG, WebGL, 3D transforms, filters
- **Temperature** — loud / quiet, dense / sparse, static / animated
- **Interaction** — none, hover-driven, cursor-driven, playable

## 2. Choose a direction

If `$ARGUMENTS` is empty, pick something unused. A starting bank — not a
limit, and better ideas are welcome:

vaporwave · blueprint / technical drawing · ransom note · isometric city ·
ASCII art · claymorphism · risograph print · generative Perlin flow field ·
particle constellation · 3D extruded text · hand-drawn / rough.js · Swiss
grid · Matrix rain · paper cut-out layers · LCD seven-segment · Bauhaus
shapes · Y2K chrome · comic halftone · art deco · stained glass · liquid
metal / blob · typewriter manuscript · botanical engraving · brutalist web
1.0 · vinyl sleeve · airline ticket · oscilloscope / waveform · knitted or
woven texture · x-ray · topographic contours · solar-punk · ferrofluid ·
kaleidoscope · newspaper front page · circuit board · aquarium · zen garden ·
neon sign wiring · lenticular · duotone photo collage · CRT test card

Pick a `<slug>` (kebab-case, permanent, matches the mood) and a `name`
(1–3 words, title case).

## 3. Build it

Create `src/designs/<slug>/index.astro`. Study an existing design first —
`src/designs/atelier/index.astro` for a quiet one, `neon-drive` for an
elaborate CSS one, `pixel-quest` for an interactive one.

Structure:

```astro
---
// One or two lines: what this design is and how it works.
---

<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=…" />

<div class="root">
  <h1>tayles</h1>
  <!-- GitHub always comes first. -->
  <a href="https://github.com/tayles">GitHub</a>
  <a href="https://linkedin.com/in/tayles">LinkedIn</a>
</div>

<style>
  /* Everything hangs off .root — never style body/html/*. */
  .root { … }
  @media (prefers-reduced-motion: reduce) { /* freeze all motion */ }
</style>
```

Then `src/designs/<slug>/index.md` — **frontmatter only**, no body. The
capture step adds the screenshot embed later.

```markdown
---
name: Neon Drive
description: One or two sentences. What a visitor sees, in concrete terms — no marketing adjectives.
date: <today, YYYY-MM-DD>
tags: [five, or, so, specific, tags]
---
```

`date` must be today (or later than every existing design) so the new design
becomes the homepage.

### Quality bar

This is a portfolio piece, not a demo. Push past the first obvious idea.

- Commit to the concept — a half-hearted theme reads as a mistake.
- Make the type do real work: scale, weight, spacing, an unexpected face.
- Composition over decoration. Consider asymmetry, bleed, overlap, depth.
- Motion should be purposeful and calm enough to live with, not a showreel.
- Style the links to belong to the design — never leave them as blue text.

## 4. Verify

On a fresh checkout — which is what the weekly cloud routine gets — install
the browser Playwright needs first, or every test will fail:

```bash
bun install
bunx playwright install --with-deps chromium
```

If `--with-deps` fails for want of root, `bunx playwright install chromium`
on its own is enough.

```bash
bun run verify
```

Format, lint, typecheck, build and the whole Playwright suite. The new design
is picked up automatically. Fix anything red before continuing.

Then look at it. Open `/designs/<slug>` in the browser at desktop **and**
mobile widths and judge it honestly. If it is merely fine, change it.

## 5. Capture and record

```bash
bun run screenshots --only <slug>
bun run designs:md
bun run verify
```

The first command writes `screenshot.webp` and adds the embed to `index.md`;
the second regenerates `DESIGNS.md`. Re-verify — the build now resolves the
screenshot, and `designs.spec.ts` checks it exists.

Look at the screenshot itself. If it caught a mid-animation frame or the wrong
font, adjust `SETTLE_MS` in `scripts/capture-screenshots.ts` or the design, and
capture again.

## 6. Ship

```bash
git switch -c design/<slug>
git add -A
git commit -m "feat(design): add <name>"
git push -u origin design/<slug>
gh pr create --title "New design: <name>" --body "…"
gh pr merge --auto --squash
```

The PR body should carry the description, the tags, and why this direction is
different from what came before. Auto-merge lands it once CI is green — never
merge past a red check, and never force-push over `main`.

If there is no git remote yet, stop after the commit and say so.
