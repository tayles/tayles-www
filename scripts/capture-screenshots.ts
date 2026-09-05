/**
 * Photographs every design and writes an optimised WebP next to it.
 *
 *   bun run screenshots                 # all designs
 *   bun run screenshots --only <slug>   # just one
 *
 * Assumes the site is already built (`bun run build`); pass --build to do it
 * here. The nav chrome is hidden before the shutter so the picture is the
 * design and nothing else.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

import { DESIGNS_DIR, readDesigns, type DesignRecord } from './designs-fs';
import { serveDist } from './serve-dist';

const PORT = 4331;
const BASE = `http://localhost:${PORT}`;
const VIEWPORT = { width: 1440, height: 900 };
/** Long enough for entrance animations to finish and loops to look settled. */
const SETTLE_MS = 2200;
const OUTPUT_WIDTH = 1440;

const args = process.argv.slice(2);
const only = args.includes('--only')
  ? args[args.indexOf('--only') + 1]
  : undefined;
const shouldBuild = args.includes('--build');

function build() {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('bun', ['run', 'build'], { stdio: 'inherit' });
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`build exited ${code}`)),
    );
  });
}

/**
 * Make sure the design's index.md carries the screenshot and its live link,
 * so browsing the directory on GitHub shows the design rather than just its
 * frontmatter.
 */
function ensureBody(design: DesignRecord) {
  const path = join(DESIGNS_DIR, design.slug, 'index.md');
  const source = readFileSync(path, 'utf8');
  const end = source.indexOf('\n---', 3);
  const frontmatter = source.slice(0, end + 4);
  const body = source.slice(end + 4).trim();

  const image = `![${design.name}](./screenshot.webp)`;
  const link = `[View it live](https://tayles.co.uk/designs/${design.slug})`;

  const lines = [image, '', design.description, '', link];
  for (const extra of body.split('\n\n')) {
    const trimmed = extra.trim();
    // Keep anything hand-written (asset credits, notes) that we didn't add.
    if (
      trimmed &&
      !trimmed.startsWith('![') &&
      !trimmed.startsWith('[View it live]') &&
      trimmed !== design.description
    ) {
      lines.push('', trimmed);
    }
  }

  writeFileSync(path, `${frontmatter}\n\n${lines.join('\n')}\n`);
}

async function main() {
  const designs = readDesigns().filter(
    (design) => !only || design.slug === only,
  );

  if (designs.length === 0) {
    throw new Error(only ? `No design named "${only}".` : 'No designs found.');
  }

  if (shouldBuild || !existsSync('dist')) {
    await build();
  }

  const server = await serveDist(PORT);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
    });

    const failures: string[] = [];
    page.on('requestfailed', (request) => {
      failures.push(`${request.url()} — ${request.failure()?.errorText}`);
    });

    for (const design of designs) {
      failures.length = 0;
      await page.goto(`${BASE}/designs/${design.slug}`, {
        waitUntil: 'networkidle',
      });

      // Webfonts come from a CDN; never photograph the fallback face.
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({
        content: '[data-design-chrome] { display: none !important; }',
      });
      await page.waitForTimeout(SETTLE_MS);

      if (failures.length > 0) {
        throw new Error(
          `${design.slug} has failing requests, refusing to photograph it:\n` +
            failures.map((f) => `  ${f}`).join('\n'),
        );
      }

      const raw = await page.screenshot({ type: 'png' });
      const out = join(DESIGNS_DIR, design.slug, 'screenshot.webp');

      await sharp(raw)
        .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toFile(out);

      ensureBody(design);
      console.log(`📸 ${design.slug} → ${out}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

await main();
