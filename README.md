# tayles-www

The homepage for **[tayles.co.uk](https://tayles.co.uk)** — a page that
redesigns itself every week.

The content never changes: the word _tayles_, a link to
[GitHub](https://github.com/tayles) and a link to
[LinkedIn](https://linkedin.com/in/tayles). Everything around it does. Every Monday a
Claude Code routine invents a new design, screenshots it and opens a pull
request that merges itself once CI is green. The newest design becomes the
homepage; every previous one keeps its own permanent URL.

📖 **[Browse every design in DESIGNS.md →](DESIGNS.md)** ·
🌐 **[See them live →](https://tayles.co.uk/designs)**

## How it fits together

Each design is a self-contained directory:

```shell
src/designs/<slug>/
├── index.astro     the design itself
├── index.md        its name, description, date and tags
└── screenshot.webp captured automatically, committed
```

`src/content.config.ts` turns those directories into an Astro
[content collection](https://docs.astro.build/en/guides/content-collections/),
and `src/lib/designs.ts` is the single place that orders them, resolves a slug
to its component, and works out what comes before and after.

| Route             | What it is                            |
| :---------------- | :------------------------------------ |
| `/`               | The newest design                     |
| `/designs`        | Gallery of every design, newest first |
| `/designs/<slug>` | One design, forever                   |

Every design page carries the same navigation chrome — previous, next, the
command palette, shuffle and a link to the gallery — as a single React island.
It sits at 30% opacity until you hover or focus it.

| Key                       | Does                     |
| :------------------------ | :----------------------- |
| `←` / `→`                 | Previous / next design   |
| `⌘K` / `Ctrl+K` / `` ` `` | Open the command palette |

The palette is a centred dialog listing every design with its screenshot,
description and date, searchable by name or tag.

Each page's OpenGraph image is the screenshot of the design it shows, so a
shared link previews exactly what the visitor will land on.

## Commands

| Command                          | What it does                          |
| :------------------------------- | :------------------------------------ |
| `bun install`                    | Install dependencies                  |
| `bunx playwright install chromium` | One-off, before the first `test`    |
| `bun run dev`                    | Dev server on `localhost:4321`        |
| `bun run build`                  | Build to `./dist/`                    |
| `bun run preview`                | Serve the built site                  |
| `bun run check`                  | Sync types, format check, lint, types |
| `bun run clean`                  | Fix formatting and auto-fixable lints |
| `bun run test`                   | Playwright suite (builds first)       |
| `bun run verify`                 | `check` + build + test — what CI runs |
| `bun run screenshots`            | Capture every screenshot              |
| `bun run screenshots --only <s>` | Capture just one                      |
| `bun run designs:md`             | Regenerate `DESIGNS.md`               |

`fmt` / `fmt:fix` and `lint` / `lint:fix` are available individually; `check`
and `clean` are the check-everything and fix-everything pair.

## Adding a design

Run the `new-design` skill in Claude Code — with or without a steer:

```shell
/new-design
/new-design something vaporwave with a koi pond
```

It picks a direction that doesn't repeat an existing one, writes the design,
verifies it, screenshots it, regenerates `DESIGNS.md` and opens a PR. See
[`.claude/skills/new-design/SKILL.md`](.claude/skills/new-design/SKILL.md) for
the rules a design has to follow, and [`AGENTS.md`](AGENTS.md) for the
conventions.

## Stack

[Astro](https://astro.build) · [Tailwind CSS](https://tailwindcss.com) ·
[React](https://react.dev) islands · [shadcn/ui](https://ui.shadcn.com) ·
[oxfmt + oxlint](https://oxc.rs) · strict TypeScript ·
[Playwright](https://playwright.dev) · [Bun](https://bun.sh)
