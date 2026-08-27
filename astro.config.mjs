// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://barlowr.com',
  output: 'static',
  build: {
    // Clean URLs: every page is emitted as <route>/index.html
    format: 'directory',
  },
});
