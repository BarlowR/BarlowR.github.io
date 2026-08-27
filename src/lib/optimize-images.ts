/**
 * Build-time image derivatives, replacing the old `optimize_images.sh`
 * workflow that mutated originals in place and checked ~200 generated `.webp`
 * siblings into the repo.
 *
 * For every `.jpg`/`.jpeg`/`.png` under the mirrored `content/` and `assets/`
 * trees this integration derives:
 *
 *   `<base>.webp`        — what `renderPhoto` in `remark-site-directives.ts`
 *                          points its `<picture><source>` at (max 1600px, q80)
 *   `<base>_thumb.webp`  — gallery-grid cells only (`assets/gallery/…`,
 *                          max 640px, q75); `photo-grid.js` derives this URL
 *                          by the same naming convention
 *
 * In dev the derivatives are generated on demand by a middleware that runs
 * after `mirror-static`'s (which calls `next()` for files not on disk); at
 * build they are written into `dist/` after the mirror copy, so this
 * integration must be registered after `mirrorStatic()`. Generated files are
 * cached in `node_modules/.cache/site-images/` keyed by source mtime, so only
 * new or edited photos are re-encoded. A real file already at a derivative's
 * path (in the repo or in `dist/`) always wins over generation.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import type { AstroIntegration } from 'astro';

const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const CACHE_DIR = path.join('node_modules', '.cache', 'site-images');

interface Variant {
  suffix: string;
  width: number;
  quality: number;
  /** Repo-relative source paths this variant applies to. */
  applies: (relPath: string) => boolean;
}

const VARIANTS: Variant[] = [
  { suffix: '', width: 1600, quality: 80, applies: () => true },
  {
    suffix: '_thumb',
    width: 640,
    quality: 75,
    applies: (rel) => rel.startsWith(path.join('assets', 'gallery') + path.sep),
  },
];

/** `photos/x_thumb.webp` -> `photos/x` + the `_thumb` variant (or null). */
function parseDerivative(relPath: string): { base: string; variant: Variant } | null {
  if (path.extname(relPath).toLowerCase() !== '.webp') return null;
  const stripped = relPath.slice(0, -'.webp'.length);
  for (const variant of [...VARIANTS].sort((a, b) => b.suffix.length - a.suffix.length)) {
    if (variant.suffix === '' || stripped.endsWith(variant.suffix)) {
      return {
        base: variant.suffix ? stripped.slice(0, -variant.suffix.length) : stripped,
        variant,
      };
    }
  }
  return null;
}

/** The source image a derivative is generated from, if one exists. */
function findSource(root: string, relBase: string): string | null {
  for (const ext of SOURCE_EXTENSIONS) {
    const candidate = path.join(root, relBase + ext);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Generate (or reuse) the cached derivative for `source`, returning the cache
 * file path. `.rotate()` bakes in the EXIF orientation the encoder strips.
 */
async function ensureDerivative(
  root: string,
  source: string,
  relDerived: string,
  variant: Variant,
): Promise<string> {
  const cached = path.join(root, CACHE_DIR, relDerived);
  const sourceStat = fs.statSync(source);
  if (fs.existsSync(cached) && fs.statSync(cached).mtimeMs >= sourceStat.mtimeMs) {
    return cached;
  }
  fs.mkdirSync(path.dirname(cached), { recursive: true });
  await sharp(source)
    .rotate()
    .resize({ width: variant.width, withoutEnlargement: true })
    .webp({ quality: variant.quality })
    .toFile(cached);
  return cached;
}

function* sourceImages(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceImages(full);
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) yield full;
  }
}

export default function optimizeImages(): AstroIntegration {
  let root = process.cwd();
  return {
    name: 'optimize-images',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(config.root);
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const url = decodeURIComponent((req.url ?? '').split('?')[0]);
          const top = url.split('/')[1];
          if (!['content', 'assets'].includes(top)) return next();
          const relPath = path.join(...url.split('/').filter(Boolean));
          const derivative = parseDerivative(relPath);
          // A real file at this path was already served by mirror-static.
          if (!derivative || fs.existsSync(path.join(root, relPath))) return next();
          const source = findSource(root, derivative.base);
          if (!source) return next();
          ensureDerivative(root, source, relPath, derivative.variant)
            .then((cached) => {
              res.setHeader('Content-Type', 'image/webp');
              fs.createReadStream(cached).pipe(res);
            })
            .catch(next);
        });
      },
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const jobs: { source: string; relDerived: string; variant: Variant }[] = [];
        for (const mirrored of ['content', 'assets']) {
          const base = path.join(root, mirrored);
          if (!fs.existsSync(base)) continue;
          for (const source of sourceImages(base)) {
            const relBase = path
              .relative(root, source)
              .slice(0, -path.extname(source).length);
            for (const variant of VARIANTS) {
              if (!variant.applies(path.relative(root, source))) continue;
              const relDerived = relBase + variant.suffix + '.webp';
              // Never clobber a real file that exists at the derivative's path.
              if (fs.existsSync(path.join(root, relDerived))) continue;
              jobs.push({ source, relDerived, variant });
            }
          }
        }
        let generated = 0;
        const workers = Array.from(
          { length: Math.max(1, os.cpus().length - 1) },
          async () => {
            for (let job = jobs.pop(); job; job = jobs.pop()) {
              const cached = await ensureDerivative(
                root,
                job.source,
                job.relDerived,
                job.variant,
              );
              const dest = path.join(outDir, job.relDerived);
              fs.mkdirSync(path.dirname(dest), { recursive: true });
              fs.copyFileSync(cached, dest);
              generated += 1;
            }
          },
        );
        await Promise.all(workers);
        logger.info(`generated ${generated} webp derivatives`);
      },
    },
  };
}
