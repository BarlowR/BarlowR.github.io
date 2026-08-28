// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkSiteDirectives from './src/lib/remark-site-directives';
import mirrorStatic from './src/lib/mirror-static';
import optimizeImages from './src/lib/optimize-images';

// https://astro.build/config
export default defineConfig({
  site: 'https://barlowr.com',
  output: 'static',
  build: {
    // Clean URLs: every page is emitted as <route>/index.html
    format: 'directory',
  },
  // optimizeImages must follow mirrorStatic: its dev middleware catches the
  // requests the mirror passes through, and its build hook fills in webp
  // derivatives after the mirror copy.
  integrations: [mirrorStatic(), optimizeImages(), sitemap()],
  markdown: {
    // `$…$` math (the Jekyll site used LaTeXMathML; KaTeX renders the same
    // delimiters at build time) plus the site's `::photo`-style directives.
    remarkPlugins: [remarkMath, remarkDirective, remarkSiteDirectives],
    rehypePlugins: [rehypeKatex],
  },
});
