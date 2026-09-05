import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';

export interface DesignRecord {
  slug: string;
  name: string;
  description: string;
  date: Date;
  tags: string[];
  hasScreenshot: boolean;
}

export const ROOT = join(import.meta.dirname, '..');
export const DESIGNS_DIR = join(ROOT, 'src', 'designs');

/** Every design on disk, oldest first. */
export function readDesigns(): DesignRecord[] {
  return readdirSync(DESIGNS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = join(DESIGNS_DIR, entry.name);
      const { data } = matter(readFileSync(join(dir, 'index.md'), 'utf8'));

      const tags: unknown = data['tags'];

      return {
        slug: entry.name,
        name: String(data['name']),
        description: String(data['description']),
        date: new Date(String(data['date'])),
        tags: Array.isArray(tags) ? tags.map(String) : [],
        hasScreenshot: existsSync(join(dir, 'screenshot.webp')),
      } satisfies DesignRecord;
    })
    .toSorted(
      (a, b) =>
        a.date.getTime() - b.date.getTime() || a.slug.localeCompare(b.slug),
    );
}
