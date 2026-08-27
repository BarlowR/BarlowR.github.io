/**
 * Renders the site's markdown directives to the same HTML the Jekyll includes
 * produced (`_includes/photo.html`, `checkbox.html`, `book.html`,
 * `cesium_view.html`, `photo_grid.html`, `plot.html`). Content was converted
 * from `{%- include foo.html … -%}` Liquid tags to remark-directive syntax by
 * `scripts/convert-includes.mjs`; this plugin is the render half of that pair.
 *
 * Directives:
 *   ::photo{src="photos/x.jpg" style="…" alt="…"}
 *   ::checkbox{label="…"}
 *   ::book{title="…" author="…" description="…"}   — or :::book with a body
 *   ::cesium-view{gpx="0217.gpx" clamp-to-ground="false" colored-track="true" height="30vw"}
 *   ::photo-grid{folder="/assets/gallery/film"}
 *   ::plot{src="plot.html"}                         — inlines the file verbatim
 *
 * Relative `src`/`gpx` paths resolve against the markdown file's own directory
 * and become absolute `/content/…` URLs — the same URLs Jekyll served, kept
 * working by the `mirror-static` integration.
 */
import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Root, Parent, RootContent } from 'mdast';
import type { VFile } from 'vfile';

type DirectiveNode = Parent & {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  attributes?: Record<string, string | null | undefined>;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Directory of the markdown source, as a site-absolute URL path (`/content/trips/…`). */
function pageBaseUrl(file: VFile): string {
  const dir = path.relative(file.cwd, path.dirname(file.path));
  return '/' + dir.split(path.sep).join('/');
}

/** Resolve an asset reference the way Jekyll's photo include did: relative
 * paths live next to the page; absolute paths and full URLs pass through. */
function resolveAssetUrl(src: string, file: VFile): string {
  if (/^([a-z]+:)?\/\//i.test(src) || src.startsWith('/')) return src;
  return `${pageBaseUrl(file)}/${src}`;
}

/**
 * Raw `<img>` tags in the markdown (only `Fabric_Analysis.md` and the
 * unpublished `Running Vests.md` have them) carried srcs relative to the
 * page, which resolved on Jekyll because pages were served from their source
 * directory. Under the clean URLs they must be absolutized the same way
 * `::photo` srcs are — and once absolute, they get the same `<picture>`/webp
 * treatment, since `optimize-images` derives a webp for every content image.
 * Runs before the directive pass, so HTML this plugin itself emits (photo
 * markup, inlined plots, the lightbox) is never touched.
 */
function rewriteRawImages(value: string, file: VFile): string {
  return value.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const src = srcMatch?.[1] ?? srcMatch?.[2];
    if (!srcMatch || !src || /^[a-z]+:/i.test(src) || src.startsWith('//')) {
      return tag;
    }
    const url = resolveAssetUrl(src, file);
    let img = tag.replace(srcMatch[0], `src="${escapeHtml(url)}"`);
    if (!/\bloading\s*=/i.test(img)) {
      img = img.replace(/^<img\b/i, '<img loading="lazy" decoding="async"');
    }
    if (!/\.(jpe?g|png)$/i.test(url)) return img;
    const webp = url.replace(/\.[^./]+$/, '') + '.webp';
    return [
      '<picture>',
      `<source srcset="${escapeHtml(webp)}" type="image/webp">`,
      img,
      '</picture>',
    ].join('');
  });
}

function renderPhoto(attrs: Record<string, string>, file: VFile): string {
  const src = attrs.src ?? '';
  const url = resolveAssetUrl(src, file);
  const webp = url.replace(/\.[^./]+$/, '') + '.webp';
  const style = attrs.style ?? '';
  const alt = attrs.alt || 'Image';
  return [
    `<a href="${escapeHtml(url)}">`,
    '    <picture>',
    '        <!-- WebP format for modern browsers -->',
    `        <source srcset="${escapeHtml(webp)}" type="image/webp">`,
    '        <!-- Fallback to original format -->',
    `        <img src="${escapeHtml(url)}"`,
    '             loading="lazy"',
    '             decoding="async"',
    `             style="width: 20%; margin: 10px;${escapeHtml(style)}"`,
    `             alt="${escapeHtml(alt)}">`,
    '    </picture>',
    '</a>',
  ].join('\n');
}

function renderCheckbox(attrs: Record<string, string>): string {
  const label = escapeHtml(attrs.label ?? '');
  return [
    `<input type="checkbox" id="${label}" name="${label}" />`,
    `<label for="${label}">${label}</label>`,
    '<br>',
  ].join('\n');
}

/**
 * Leaf form renders the whole entry; container form leaves the description
 * open so the directive body (regular markdown) renders inside it — the
 * open/close tags are returned separately and the body nodes stay in the tree.
 */
function renderBook(
  attrs: Record<string, string>,
  body: RootContent[] | null,
): RootContent[] {
  const title = attrs.title ? escapeHtml(attrs.title) : 'Untitled';
  let open = `<div class="book-entry">\n    <div class="book-title">${title}</div>`;
  if (attrs.author) {
    open += `\n    <div class="book-author">${escapeHtml(attrs.author)}</div>`;
  }
  if (body && body.length > 0) {
    return [
      { type: 'html', value: `${open}\n    <div class="book-description">` },
      ...body,
      { type: 'html', value: '    </div>\n</div>' },
    ];
  }
  if (attrs.description) {
    open += `\n    <div class="book-description">${escapeHtml(attrs.description)}</div>`;
  }
  return [{ type: 'html', value: `${open}\n</div>` }];
}

const CESIUM_HEAD = [
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/cesium/1.95.0/Cesium.js"></script>',
  '<link href="https://cdnjs.cloudflare.com/ajax/libs/cesium/1.95.0/Widgets/widgets.css" rel="stylesheet">',
  '<script src="/assets/js/cesium-view.js" defer></script>',
].join('\n');

function renderCesiumView(
  attrs: Record<string, string>,
  file: VFile,
  firstOnPage: boolean,
): string {
  const gpx = resolveAssetUrl(attrs.gpx ?? attrs.gpx_file ?? '', file);
  const clamp = (attrs['clamp-to-ground'] ?? attrs.clamp_to_ground) === 'true';
  const colored = (attrs['colored-track'] ?? attrs.colored_track) === 'true';
  const height = attrs.height ? ` style="height: ${escapeHtml(attrs.height)};"` : '';
  const div =
    `<div class="cesium-view" data-gpx="${escapeHtml(gpx)}"` +
    ` data-clamp-to-ground="${clamp}" data-colored-track="${colored}"${height}></div>\n` +
    '<i> Click and drag to pan. Scroll to zoom. Control + click and drag to rotate </i>';
  return firstOnPage ? `${CESIUM_HEAD}\n${div}` : div;
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

/** Mirrors `photo_grid.html`: list the folder's images, name-sorted, newest-name
 * first. The folder is a repo-root-relative URL path (`/assets/gallery/film`). */
function renderPhotoGrid(attrs: Record<string, string>, file: VFile): string {
  const folder = attrs.folder ?? attrs.imgFolder ?? '/assets/gallery';
  const dir = path.join(file.cwd, ...folder.split('/'));
  const images = fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort()
    .reverse()
    .map((name) => `${folder.replace(/\/$/, '')}/${name}`);
  return [
    '<div class="gallery-container">',
    `    <div id="gallery" class="gallery" data-images="${escapeHtml(JSON.stringify(images))}"></div>`,
    '</div>',
    '',
    '<div id="lightbox" class="lightbox">',
    '    <div class="lightbox-content">',
    '        <span class="lightbox-close">&times;</span>',
    '        <img class="lightbox-image" id="lightbox-img" src="" alt="">',
    '        <div class="lightbox-nav">',
    '            <div class="lightbox-prev">&lt;</div>',
    '            <div class="lightbox-next">&gt;</div>',
    '        </div>',
    '    </div>',
    '</div>',
    '<script src="/assets/js/photo-grid.js" defer></script>',
  ].join('\n');
}

/** Inline an HTML partial that lives next to the markdown file. */
function renderPlot(attrs: Record<string, string>, file: VFile): string {
  const src = attrs.src ?? 'plot.html';
  return fs.readFileSync(path.join(path.dirname(file.path), src), 'utf8');
}

export default function remarkSiteDirectives() {
  return (tree: Root, file: VFile) => {
    visit(tree, 'html', (node) => {
      node.value = rewriteRawImages(node.value, file);
    });
    let cesiumCount = 0;
    visit(tree, (node, index, parent) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return;
      }
      const directive = node as DirectiveNode;
      if (parent === undefined || index === undefined) return;

      const attrs: Record<string, string> = {};
      for (const [key, value] of Object.entries(directive.attributes ?? {})) {
        if (value != null) attrs[key] = value;
      }

      let replacement: RootContent[] | null = null;
      switch (directive.name) {
        case 'photo':
          replacement = [{ type: 'html', value: renderPhoto(attrs, file) }];
          break;
        case 'checkbox':
          replacement = [{ type: 'html', value: renderCheckbox(attrs) }];
          break;
        case 'book':
          replacement = renderBook(
            attrs,
            directive.type === 'containerDirective'
              ? (directive.children as RootContent[])
              : null,
          );
          break;
        case 'cesium-view':
          replacement = [
            { type: 'html', value: renderCesiumView(attrs, file, cesiumCount++ === 0) },
          ];
          break;
        case 'photo-grid':
          replacement = [{ type: 'html', value: renderPhotoGrid(attrs, file) }];
          break;
        case 'plot':
          replacement = [{ type: 'html', value: renderPlot(attrs, file) }];
          break;
        default:
          // Unknown directives (including stray `::` text) are left alone.
          return;
      }

      parent.children.splice(index, 1, ...(replacement as typeof parent.children));
      return index + replacement.length;
    });
  };
}
