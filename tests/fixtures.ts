import { readDesigns } from '../scripts/designs-fs';

export const designs = readDesigns();

export const firstDesign = designs[0]!;
export const secondDesign = designs[1] ?? firstDesign;
export const latestDesign = designs.at(-1)!;

export function neighboursOf(slug: string) {
  const index = designs.findIndex((design) => design.slug === slug);
  return {
    previous: designs.at((index - 1) % designs.length)!,
    next: designs[(index + 1) % designs.length]!,
  };
}

/**
 * The nav chrome is an island: its key handlers only exist once React has
 * hydrated. Astro drops the `ssr` attribute when that happens.
 */
export async function waitForChrome(page: import('@playwright/test').Page) {
  await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
}
