/**
 * Jekyll served the whole repo, so every photo, GPX track and gallery image is
 * referenced at its in-repo path (`/content/trips/…/photos/x.jpg`,
 * `/assets/gallery/…`). Astro only serves `public/`, and moving thousands of
 * photos under `public/` would divorce them from the markdown they belong to.
 *
 * This integration keeps the repo layout and the URLs: in dev it serves the
 * mirrored directories straight from the repo; at build it copies them into
 * `dist/` (markdown sources and dotfiles excluded).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

const MIRRORED_DIRS = ['content', 'assets'];

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.gpx': 'application/gpx+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.html': 'text/html',
};

function isMirrored(relPath: string): boolean {
  const parts = relPath.split(path.sep);
  return (
    !parts.some((part) => part.startsWith('.')) &&
    path.extname(relPath).toLowerCase() !== '.md'
  );
}

export default function mirrorStatic(): AstroIntegration {
  let root = process.cwd();
  return {
    name: 'mirror-static',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(config.root);
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const url = decodeURIComponent((req.url ?? '').split('?')[0]);
          const top = url.split('/')[1];
          if (!MIRRORED_DIRS.includes(top)) return next();
          const filePath = path.join(root, ...url.split('/'));
          const relPath = path.relative(root, filePath);
          if (
            relPath.startsWith('..') ||
            !isMirrored(relPath) ||
            !fs.existsSync(filePath) ||
            !fs.statSync(filePath).isFile()
          ) {
            return next();
          }
          const mime = MIME_TYPES[path.extname(filePath).toLowerCase()];
          if (mime) res.setHeader('Content-Type', mime);
          fs.createReadStream(filePath).pipe(res);
        });
      },
      'astro:build:done': ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        for (const mirrored of MIRRORED_DIRS) {
          const src = path.join(root, mirrored);
          if (!fs.existsSync(src)) continue;
          fs.cpSync(src, path.join(outDir, mirrored), {
            recursive: true,
            filter: (source) => {
              const rel = path.relative(root, source);
              return rel === mirrored || isMirrored(rel);
            },
          });
          logger.info(`mirrored ${mirrored}/ into the build output`);
        }
      },
    },
  };
}
