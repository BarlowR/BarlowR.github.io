// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkSiteDirectives from './src/lib/remark-site-directives';
import mirrorStatic from './src/lib/mirror-static';

// https://astro.build/config
export default defineConfig({
  site: 'https://barlowr.com',
  output: 'static',
  build: {
    // Clean URLs: every page is emitted as <route>/index.html
    format: 'directory',
  },
  integrations: [mirrorStatic()],
  markdown: {
    // `$…$` math (the Jekyll site used LaTeXMathML; KaTeX renders the same
    // delimiters at build time) plus the site's `::photo`-style directives.
    remarkPlugins: [remarkMath, remarkDirective, remarkSiteDirectives],
    rehypePlugins: [rehypeKatex],
  },
});
