import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join, normalize } from 'node:path';

import { ROOT } from './designs-fs';

const DIST = join(ROOT, 'dist');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
};

/** Resolve a request path to a file inside dist, or undefined. */
function resolve(pathname: string): string | undefined {
  // normalize() collapses `..`, and the prefix check keeps us inside dist.
  const target = normalize(join(DIST, decodeURIComponent(pathname)));
  if (!target.startsWith(DIST)) return undefined;

  if (existsSync(target) && statSync(target).isFile()) return target;

  const index = join(target, 'index.html');
  if (existsSync(index)) return index;

  const html = `${target}.html`;
  if (existsSync(html)) return html;

  return undefined;
}

/**
 * A minimal static server for `dist/`.
 *
 * `astro preview` daemonises itself in some environments, which makes it
 * awkward to start and stop deterministically from a script — this does the
 * one job we need and nothing else.
 */
export function serveDist(port: number): Promise<Server> {
  if (!existsSync(DIST)) {
    throw new Error('dist/ does not exist — run `bun run build` first.');
  }

  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    const file = resolve(pathname);

    if (!file) {
      const notFound = join(DIST, '404.html');
      response.writeHead(404, { 'content-type': MIME['.html']! });
      if (existsSync(notFound)) {
        createReadStream(notFound).pipe(response);
      } else {
        response.end('Not found');
      }
      return;
    }

    response.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(response);
  });

  return new Promise((resolve_, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve_(server));
  });
}

// `bun run scripts/serve-dist.ts [port]` — used by Playwright's webServer.
if (import.meta.main) {
  const port = Number(process.argv[2] ?? 4321);
  await serveDist(port);
  console.log(`Serving dist/ on http://localhost:${port}`);
}
