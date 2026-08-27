/**
 * One-time migration for the Astro port: rewrite Jekyll Liquid include tags in
 * the markdown content to remark-directive syntax, rendered by
 * `src/lib/remark-site-directives.ts`.
 *
 *   {%- include photo.html path="X" style="Y" -%}   -> ::photo{src="X" style="Y"}
 *   {%- include checkbox.html label="L" -%}         -> ::checkbox{label="L"}
 *   {%- include cesium_view.html gpx_file = "f" … -%}
 *       -> ::cesium-view{gpx="f" clamp-to-ground="…" colored-track="…" height="…"}
 *   {%- include photo_grid.html imgFolder='/x' -%}  -> ::photo-grid{folder="/x"}
 *   {% include book.html title="T" author="A" %}    -> ::book{title="T" author="A"}
 *     …with a description                           -> :::book{…} body :::
 *   {% include plot.html %}                         -> ::plot{src="plot.html"}
 *
 * Usage: node scripts/convert-includes.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';

const dryRun = process.argv.includes('--dry-run');
const root = process.cwd();

const INCLUDE_RE = /\{%-?\s*include\s+([a-z_]+)\.html([\s\S]*?)-?%\}/g;
const PARAM_RE = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*("([^"]*)"|'([^']*)'|[^\s"']+)/g;

function parseParams(raw) {
  const params = {};
  for (const m of raw.matchAll(PARAM_RE)) {
    params[m[1]] = m[3] ?? m[4] ?? m[2];
  }
  return params;
}

function attr(name, value) {
  if (value === undefined) return null;
  if (!value.includes('"')) return `${name}="${value}"`;
  if (!value.includes("'")) return `${name}='${value}'`;
  throw new Error(`Attribute value mixes both quote styles: ${value}`);
}

function directive(name, pairs) {
  const attrs = pairs.filter(Boolean).join(' ');
  return `::${name}{${attrs}}`;
}

function convertInclude(includeName, params, file) {
  switch (includeName) {
    case 'photo':
      return directive('photo', [
        attr('src', params.path),
        attr('style', params.style),
        attr('alt', params.alt),
      ]);
    case 'checkbox':
      return directive('checkbox', [attr('label', params.label)]);
    case 'cesium_view':
      // `num` disambiguated Liquid-generated element ids; the directive
      // renderer indexes maps per page on its own.
      return directive('cesium-view', [
        attr('gpx', params.gpx_file),
        attr('clamp-to-ground', params.clamp_to_ground),
        attr('colored-track', params.colored_track),
        attr('height', params.height),
      ]);
    case 'photo_grid':
      return directive('photo-grid', [attr('folder', params.imgFolder)]);
    case 'book': {
      const head = [attr('title', params.title), attr('author', params.author)];
      if (params.description) {
        return `:${directive('book', head)}\n${params.description}\n:::`;
      }
      return directive('book', head);
    }
    case 'plot':
      return directive('plot', [attr('src', 'plot.html')]);
    default:
      throw new Error(`No conversion for include "${includeName}" in ${file}`);
  }
}

function* markdownFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(full);
    else if (entry.name.endsWith('.md')) yield full;
  }
}

const files = [...markdownFiles(path.join(root, 'content')), path.join(root, 'books.md')];
let changed = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  let converted = source.replace(INCLUDE_RE, (match, name, rawParams, offset) => {
    let out = convertInclude(name, parseParams(rawParams), file);
    // Directives are block-level: they must start at a line beginning and own
    // the rest of their line.
    const before = source.slice(0, offset);
    const lineStart = /(^|\n)[ \t]*$/.test(before);
    if (!lineStart) out = '\n' + out;
    return out;
  });
  // Drop whitespace Jekyll's `-%}` used to swallow after a directive so the
  // directive owns its line ("::photo{…} \ntext" parses, but keep it clean).
  converted = converted.replace(/^(:::?[a-z-]+\{[^\n]*\})[ \t]+$/gm, '$1');
  if (converted !== source) {
    changed++;
    console.log(`converted: ${path.relative(root, file)}`);
    if (!dryRun) fs.writeFileSync(file, converted);
  }
}
console.log(`${changed} file(s) ${dryRun ? 'would be ' : ''}converted`);
