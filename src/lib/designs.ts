import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { getImage } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

export type DesignEntry = CollectionEntry<'designs'>;

/** A design as handed to the client-side nav — plain, serialisable data. */
export interface DesignSummary {
  slug: string;
  name: string;
  description: string;
  /** ISO date string; the client only ever formats it. */
  date: string;
  tags: string[];
  href: string;
  /** Small preview for the command palette; absent until first captured. */
  thumbnail: string | undefined;
}

const componentModules = import.meta.glob<{ default: AstroComponentFactory }>(
  '../designs/*/index.astro',
  { eager: true },
);

const screenshotModules = import.meta.glob<{ default: ImageMetadata }>(
  '../designs/*/screenshot.{webp,png,jpg,jpeg,avif}',
  { eager: true },
);

/** `../designs/neon-drive/index.astro` -> `neon-drive` */
function slugFromPath(path: string): string {
  return path.split('/').at(-2) ?? path;
}

function byPathSlug<T>(modules: Record<string, T>): Map<string, T> {
  return new Map(
    Object.entries(modules).map(([path, mod]) => [slugFromPath(path), mod]),
  );
}

const components = byPathSlug(componentModules);
const screenshots = byPathSlug(screenshotModules);

let cache: DesignEntry[] | undefined;

/**
 * All designs, oldest first, so a design's position never shifts as new ones
 * are added. Ties on date fall back to slug so the order is deterministic.
 *
 * Throws when a design directory is half-scaffolded — better to fail the
 * build (and therefore CI) than to ship a broken route.
 */
export async function getOrderedDesigns(): Promise<DesignEntry[]> {
  if (cache) return cache;

  const entries = await getCollection('designs');

  for (const entry of entries) {
    if (!components.has(entry.id)) {
      throw new Error(
        `Design "${entry.id}" has an index.md but no index.astro. ` +
          `Every design needs both in src/designs/${entry.id}/.`,
      );
    }
  }

  for (const slug of components.keys()) {
    if (!entries.some((entry) => entry.id === slug)) {
      throw new Error(
        `Design "${slug}" has an index.astro but no index.md. ` +
          `Every design needs both in src/designs/${slug}/.`,
      );
    }
  }

  cache = entries.toSorted(
    (a, b) =>
      a.data.date.getTime() - b.data.date.getTime() || a.id.localeCompare(b.id),
  );

  return cache;
}

export async function toSummary(entry: DesignEntry): Promise<DesignSummary> {
  return {
    slug: entry.id,
    name: entry.data.name,
    description: entry.data.description,
    date: entry.data.date.toISOString(),
    tags: entry.data.tags,
    href: designHref(entry.id),
    thumbnail: await getThumbnail(entry.id),
  };
}

export async function getDesignSummaries(): Promise<DesignSummary[]> {
  const designs = await getOrderedDesigns();
  return Promise.all(designs.map(toSummary));
}

/** A retina-sized preview for the command palette's 120px-wide tiles. */
async function getThumbnail(slug: string): Promise<string | undefined> {
  const screenshot = getDesignScreenshot(slug);
  if (!screenshot) return undefined;

  const image = await getImage({
    src: screenshot,
    width: 320,
    height: 200,
    fit: 'cover',
    format: 'webp',
    quality: 70,
  });

  return image.src;
}

export function designHref(slug: string): string {
  return `/designs/${slug}`;
}

export function getDesignComponent(slug: string): AstroComponentFactory {
  const mod = components.get(slug);
  if (!mod) throw new Error(`No design component for "${slug}".`);
  return mod.default;
}

export function getDesignScreenshot(slug: string): ImageMetadata | undefined {
  return screenshots.get(slug)?.default;
}

/** The design shown on `/` — the most recent one. */
export async function getLatestDesign(): Promise<DesignEntry> {
  const designs = await getOrderedDesigns();
  const latest = designs.at(-1);
  if (!latest) {
    throw new Error('No designs found in src/designs/.');
  }
  return latest;
}

/** Previous and next, wrapping at both ends so cycling never dead-ends. */
export async function getNeighbours(
  slug: string,
): Promise<{ previous: DesignEntry; next: DesignEntry; index: number }> {
  const designs = await getOrderedDesigns();
  const index = designs.findIndex((entry) => entry.id === slug);
  if (index === -1) throw new Error(`Unknown design "${slug}".`);

  const previous = designs.at((index - 1) % designs.length);
  const next = designs[(index + 1) % designs.length];
  if (!previous || !next) throw new Error(`Unknown design "${slug}".`);

  return { previous, next, index };
}

/**
 * The design's own screenshot, sized for a social card. Returns undefined
 * before the design has been photographed for the first time.
 */
export async function getSocialImage(
  slug: string,
): Promise<string | undefined> {
  const screenshot = getDesignScreenshot(slug);
  if (!screenshot) return undefined;

  const image = await getImage({
    src: screenshot,
    width: 1200,
    height: 630,
    fit: 'cover',
    format: 'jpg',
  });

  return image.src;
}

/** The social image for the design the site currently opens on. */
export async function getLatestSocialImage(): Promise<string | undefined> {
  const latest = await getLatestDesign();
  return getSocialImage(latest.id);
}
